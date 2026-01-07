// ============================================
// Fish Farm Consultant - Backend Server
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve Static Files (Frontend)
app.use(express.static(__dirname)); // Serve files from current directory

// ============================================
// Server Start (Moved to top for Railway)
// ============================================

// Health Check Endpoint (For Railway)
app.get('/health', (req, res) => res.send('OK'));

// Route Root to index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// IMPORTANT: Bind to 0.0.0.0 for external access
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
    console.log(`📊 API endpoints available at http://0.0.0.0:${PORT}/api`);
});

// ============================================
// Database Logic (Async Initialization)
// ============================================

const dbPath = path.join(__dirname, 'database.sqlite');
let db;

try {
    db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            console.error('❌ CRITICAL: Could not connect to database:', err);
        } else {
            console.log('✅ Connected to SQLite database');
            // Check and Initialize Tables
            initDB();
        }
    });
} catch (error) {
    console.error('❌ Failed to create database instance:', error);
}

function initDB() {
    if (!db) return;

    db.serialize(() => {
        // 1. Create Tables
        db.run(`CREATE TABLE IF NOT EXISTS articles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            category TEXT,
            icon TEXT,
            date TEXT,
            summary TEXT,
            content TEXT,
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS questions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_text TEXT NOT NULL,
            question_number INTEGER,
            section TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS question_options (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            option_value TEXT,
            option_label TEXT,
            option_icon TEXT,
            FOREIGN KEY(question_id) REFERENCES questions(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            answers TEXT,
            ai_response TEXT,
            provider TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS site_content (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // 2. Check and Load Articles
        db.get("SELECT COUNT(*) as count FROM articles", [], (err, row) => {
            if (err) {
                console.error("Error checking articles:", err);
            } else if (row && row.count === 0) {
                console.log("📂 Database empty. Loading initial articles...");
                loadInitialArticles();
            } else {
                console.log(`✅ Database ready. Found ${row ? row.count : 0} articles.`);
            }
        });
    });
}

function loadInitialArticles() {
    const sqlFile = path.join(__dirname, 'add_articles.sql');
    if (fs.existsSync(sqlFile)) {
        fs.readFile(sqlFile, 'utf8', (err, data) => {
            if (err) {
                console.error("❌ Error reading SQL file:", err);
                return;
            }

            // Execute SQL script
            db.exec(data, (err) => {
                if (err) {
                    console.error("❌ Error executing initial SQL script:", err);
                } else {
                    console.log("✅ Initial articles loaded successfully!");
                }
            });
        });
    } else {
        console.warn("⚠️ add_articles.sql not found. Skipping initial data load.");
    }
}

// ============================================
// API Endpoints
// ============================================

// Articles API
app.get('/api/articles', (req, res) => {
    db.all('SELECT * FROM articles ORDER BY date DESC', [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

app.get('/api/articles/:id', (req, res) => {
    db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, row) => {
        if (err) res.status(500).json({ error: err.message });
        else if (!row) res.status(404).json({ error: 'Article not found' });
        else res.json(row);
    });
});

app.post('/api/articles', (req, res) => {
    const { title, category, icon, date, summary, content, image_url } = req.body;
    const sql = `INSERT INTO articles (title, category, icon, date, summary, content, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    db.run(sql, [title, category, icon, date, summary, content, image_url], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ id: this.lastID, message: 'Article created successfully' });
    });
});

app.put('/api/articles/:id', (req, res) => {
    const { title, category, icon, date, summary, content, image_url } = req.body;
    const sql = `UPDATE articles SET title = ?, category = ?, icon = ?, date = ?, summary = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
    db.run(sql, [title, category, icon, date, summary, content, image_url, req.params.id], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ message: 'Article updated successfully' });
    });
});

app.delete('/api/articles/:id', (req, res) => {
    db.run('DELETE FROM articles WHERE id = ?', [req.params.id], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ message: 'Article deleted successfully' });
    });
});

// Questions API
app.get('/api/questions', (req, res) => {
    db.all('SELECT * FROM questions ORDER BY question_number ASC', [], (err, questions) => {
        if (err) return res.status(500).json({ error: err.message });
        db.all('SELECT * FROM question_options', [], (err, options) => {
            if (err) return res.status(500).json({ error: err.message });
            const result = questions.map(q => ({
                ...q,
                options: options.filter(o => o.question_id === q.id)
            }));
            res.json(result);
        });
    });
});

app.put('/api/questions/:id', (req, res) => {
    const { question_text, options } = req.body;
    const questionId = req.params.id;
    db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        db.run('UPDATE questions SET question_text = ? WHERE id = ?', [question_text, questionId], (err) => {
            if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: err.message }); }
            db.run('DELETE FROM question_options WHERE question_id = ?', [questionId], (err) => {
                if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: err.message }); }
                if (options && options.length > 0) {
                    const stmt = db.prepare('INSERT INTO question_options (question_id, option_value, option_label, option_icon) VALUES (?, ?, ?, ?)');
                    options.forEach(opt => stmt.run(questionId, opt.option_value, opt.option_label, opt.option_icon));
                    stmt.finalize((err) => {
                        if (err) { db.run('ROLLBACK'); return res.status(500).json({ error: err.message }); }
                        db.run('COMMIT'); res.json({ message: 'Question updated successfully' });
                    });
                } else {
                    db.run('COMMIT'); res.json({ message: 'Question updated successfully' });
                }
            });
        });
    });
});

// Consultations API
app.post('/api/consultations', (req, res) => {
    const { answers, ai_response, provider } = req.body;
    const sql = `INSERT INTO consultations (answers, ai_response, provider) VALUES (?, ?, ?)`;
    db.run(sql, [JSON.stringify(answers), ai_response, provider], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ id: this.lastID, message: 'Consultation saved' });
    });
});

app.get('/api/consultations', (req, res) => {
    const limit = req.query.limit || 50;
    db.all('SELECT * FROM consultations ORDER BY created_at DESC LIMIT ?', [limit], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else res.json(rows);
    });
});

// Site Content API
app.get('/api/content', (req, res) => {
    db.all('SELECT * FROM site_content', [], (err, rows) => {
        if (err) res.status(500).json({ error: err.message });
        else {
            const content = {};
            rows.forEach(row => content[row.key] = row.value);
            res.json(content);
        }
    });
});

app.put('/api/content/:key', (req, res) => {
    const { value } = req.body;
    const sql = `INSERT INTO site_content (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`;
    db.run(sql, [req.params.key, value, value], function (err) {
        if (err) res.status(500).json({ error: err.message });
        else res.json({ message: 'Content updated successfully' });
    });
});

// Stats API
app.get('/api/stats', (req, res) => {
    const stats = {};
    db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
        if (!err) stats.articlesCount = row ? row.count : 0;
        db.get('SELECT COUNT(*) as count FROM consultations', [], (err, row) => {
            if (!err) stats.consultationsCount = row ? row.count : 0;
            db.get('SELECT COUNT(*) as count FROM consultations WHERE DATE(created_at) = DATE("now")', [], (err, row) => {
                if (!err) stats.todayConsultations = row ? row.count : 0;
                res.json(stats);
            });
        });
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    if (db) {
        db.close((err) => {
            if (err) console.error('Error closing database:', err);
            else console.log('Database connection closed');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});
