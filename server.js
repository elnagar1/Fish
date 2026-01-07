// ============================================
// Fish Farm Consultant - Backend Server
// ============================================

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Serve Static Files (Frontend)
app.use(express.static(__dirname)); // Serve files from current directory


// Database connection
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error connecting to database:', err);
    } else {
        console.log('✅ Connected to SQLite database');
    }
});

// ============================================
// Articles API
// ============================================

// Get all articles
app.get('/api/articles', (req, res) => {
    db.all('SELECT * FROM articles ORDER BY date DESC', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Get single article
app.get('/api/articles/:id', (req, res) => {
    db.get('SELECT * FROM articles WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (!row) {
            res.status(404).json({ error: 'Article not found' });
        } else {
            res.json(row);
        }
    });
});

// Create article
app.post('/api/articles', (req, res) => {
    const { title, category, icon, date, summary, content, image_url } = req.body;

    const sql = `INSERT INTO articles (title, category, icon, date, summary, content, image_url) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [title, category, icon, date, summary, content, image_url], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: 'Article created successfully' });
        }
    });
});

// Update article
app.put('/api/articles/:id', (req, res) => {
    const { title, category, icon, date, summary, content, image_url } = req.body;

    const sql = `UPDATE articles 
                 SET title = ?, category = ?, icon = ?, date = ?, 
                     summary = ?, content = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP
                 WHERE id = ?`;

    db.run(sql, [title, category, icon, date, summary, content, image_url, req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Article updated successfully', changes: this.changes });
        }
    });
});

// Delete article
app.delete('/api/articles/:id', (req, res) => {
    db.run('DELETE FROM articles WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Article deleted successfully', changes: this.changes });
        }
    });
});

// ============================================
// Site Content API
// ============================================

// Get all site content
app.get('/api/content', (req, res) => {
    db.all('SELECT * FROM site_content', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            const content = {};
            rows.forEach(row => {
                content[row.key] = row.value;
            });
            res.json(content);
        }
    });
});

// Update site content
app.put('/api/content/:key', (req, res) => {
    const { value } = req.body;

    const sql = `INSERT INTO site_content (key, value) VALUES (?, ?)
                 ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`;

    db.run(sql, [req.params.key, value, value], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Content updated successfully' });
        }
    });
});

// ============================================
// Questions API
// ============================================

// Get all questions with options
app.get('/api/questions', (req, res) => {
    const questionsQuery = 'SELECT * FROM questions ORDER BY question_number ASC';
    const optionsQuery = 'SELECT * FROM question_options';

    db.all(questionsQuery, [], (err, questions) => {
        if (err) return res.status(500).json({ error: err.message });

        db.all(optionsQuery, [], (err, options) => {
            if (err) return res.status(500).json({ error: err.message });

            const result = questions.map(q => ({
                ...q,
                options: options.filter(o => o.question_id === q.id)
            }));
            res.json(result);
        });
    });
});

// Update question (and its options)
app.put('/api/questions/:id', (req, res) => {
    const { question_text, options } = req.body;
    const questionId = req.params.id;

    db.serialize(() => {
        db.run('BEGIN TRANSACTION');

        // Update Question Text
        db.run('UPDATE questions SET question_text = ? WHERE id = ?', [question_text, questionId], (err) => {
            if (err) {
                db.run('ROLLBACK');
                return res.status(500).json({ error: err.message });
            }

            // Delete old options
            db.run('DELETE FROM question_options WHERE question_id = ?', [questionId], (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ error: err.message });
                }

                // Insert new options
                if (options && options.length > 0) {
                    const stmt = db.prepare('INSERT INTO question_options (question_id, option_value, option_label, option_icon) VALUES (?, ?, ?, ?)');
                    options.forEach(opt => {
                        stmt.run(questionId, opt.option_value, opt.option_label, opt.option_icon);
                    });
                    stmt.finalize((err) => {
                        if (err) {
                            db.run('ROLLBACK');
                            return res.status(500).json({ error: err.message });
                        }
                        db.run('COMMIT');
                        res.json({ message: 'Question updated successfully' });
                    });
                } else {
                    db.run('COMMIT');
                    res.json({ message: 'Question updated successfully (no options)' });
                }
            });
        });
    });
});

// ============================================
// Consultations API
// ============================================

// Save consultation
app.post('/api/consultations', (req, res) => {
    const { answers, ai_response, provider } = req.body;

    const sql = `INSERT INTO consultations (answers, ai_response, provider) 
                 VALUES (?, ?, ?)`;

    db.run(sql, [JSON.stringify(answers), ai_response, provider], function (err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: 'Consultation saved' });
        }
    });
});

// Get consultations history
app.get('/api/consultations', (req, res) => {
    const limit = req.query.limit || 50;
    db.all('SELECT * FROM consultations ORDER BY created_at DESC LIMIT ?', [limit], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// ============================================
// Statistics API
// ============================================

app.get('/api/stats', (req, res) => {
    const stats = {};

    db.get('SELECT COUNT(*) as count FROM articles', [], (err, row) => {
        if (!err) stats.articlesCount = row.count;

        db.get('SELECT COUNT(*) as count FROM consultations', [], (err, row) => {
            if (!err) stats.consultationsCount = row.count;

            db.get('SELECT COUNT(*) as count FROM consultations WHERE DATE(created_at) = DATE("now")', [], (err, row) => {
                if (!err) stats.todayConsultations = row.count;
                res.json(stats);
            });
        });
    });
});

// ============================================
// Server Start
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});
