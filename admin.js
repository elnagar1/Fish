// ============================================
// Admin Panel - Main Logic
// ============================================

class AdminPanel {
    constructor() {
        this.articles = [];
        this.siteContent = {};
        this.init();
    }

    async init() {
        this.initQuill();
        this.bindEvents();
        await this.loadDashboard();
        await this.loadArticles();
        await this.loadSiteContent();
        await this.loadQuestions();
    }


    initQuill() {
        this.quill = new Quill('#editor-container', {
            theme: 'snow',
            placeholder: 'اكتب محتوى المقال هنا... استخدم شريط الأدوات للتنسيق',
            modules: {
                toolbar: [
                    // Headers
                    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                    // Font & Size
                    [{ 'font': [] }],
                    [{ 'size': ['small', false, 'large', 'huge'] }],

                    // Text Formatting
                    ['bold', 'italic', 'underline', 'strike'],

                    // Colors
                    [{ 'color': [] }, { 'background': [] }],

                    // Scripts
                    [{ 'script': 'sub' }, { 'script': 'super' }],

                    // Lists
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    [{ 'indent': '-1' }, { 'indent': '+1' }],

                    // Alignment & Direction
                    [{ 'align': [] }],
                    [{ 'direction': 'rtl' }],

                    // Blocks
                    ['blockquote', 'code-block'],

                    // Media
                    ['link', 'image', 'video'],

                    // Clean
                    ['clean']
                ]
            }
        });

        // Fix for RTL alignment by default
        this.quill.format('direction', 'rtl');
        this.quill.format('align', 'right');

        // Add custom styles for better readability
        const editorElement = document.querySelector('#editor-container .ql-editor');
        if (editorElement) {
            editorElement.style.fontSize = '16px';
            editorElement.style.lineHeight = '1.8';
            editorElement.style.minHeight = '350px';
        }
    }

    bindEvents() {
        // Navigation
        document.querySelectorAll('.nav-item[data-section]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
            });
        });

        // Article Management
        document.getElementById('addArticleBtn').addEventListener('click', () => this.openArticleModal());
        document.getElementById('closeArticleModal').addEventListener('click', () => this.closeArticleModal());
        document.getElementById('cancelArticleBtn').addEventListener('click', () => this.closeArticleModal());
        document.getElementById('articleForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveArticle();
        });

        // Question Management
        document.getElementById('closeQuestionModal').addEventListener('click', () => this.closeQuestionModal());
        document.getElementById('cancelQuestionBtn').addEventListener('click', () => this.closeQuestionModal());
        document.getElementById('questionForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveQuestion();
        });
        document.getElementById('addOptionBtn').addEventListener('click', () => this.addOptionInput());

        // Content Management
        document.getElementById('saveContentBtn').addEventListener('click', () => this.saveContent());

        // AI Settings
        document.getElementById('saveAISettingsBtn').addEventListener('click', () => this.saveAISettings());

        // Data Management
        document.getElementById('exportDataBtn').addEventListener('click', () => this.exportData());
        document.getElementById('importDataBtn').addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });
        document.getElementById('importFileInput').addEventListener('change', (e) => this.importData(e));

        // Image Upload
        document.getElementById('articleImage').addEventListener('change', (e) => this.handleImageUpload(e));
        document.getElementById('removeImageBtn').addEventListener('click', () => this.removeImage());

        // Modal overlay
        document.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeArticleModal();
            this.closeQuestionModal();
        });
    }

    // ... (rest of methods)

    // ============ Questions Management ============
    async loadQuestions() {
        const container = document.getElementById('questionsList');
        container.innerHTML = '<p style="text-align: center;">جاري التحميل...</p>';

        try {
            this.questions = await API.getQuestions();
            container.innerHTML = '';

            if (this.questions.length === 0) {
                container.innerHTML = '<p style="text-align: center;">لا توجد أسئلة.</p>';
                return;
            }

            this.questions.forEach(q => {
                const item = document.createElement('div');
                item.className = 'question-item';
                item.style.cssText = 'background: white; padding: 1rem; border-radius: 10px; margin-bottom: 1rem; box-shadow: 0 2px 5px rgba(0,0,0,0.05);';

                const optionsHtml = q.options.map(o =>
                    `<span class="badge" style="background: #eee; padding: 2px 8px; border-radius: 4px; margin: 0 2px; font-size: 0.85rem;">${o.option_icon || ''} ${o.option_label}</span>`
                ).join('');

                item.innerHTML = `
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h4 style="margin: 0 0 5px 0;">السؤال ${q.question_number}: ${q.question_text}</h4>
                            <div style="margin-top: 5px;">${optionsHtml}</div>
                        </div>
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.editQuestion(${q.id})">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                    </div>
                `;
                container.appendChild(item);
            });

            // Update stats
            const questionsCountEl = document.querySelector('.stat-card:nth-child(2) h3');
            if (questionsCountEl) questionsCountEl.textContent = this.questions.length;

        } catch (error) {
            console.error('Error loading questions:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--admin-danger);">حدث خطأ في تحميل الأسئلة</p>';
        }
    }

    editQuestion(id) {
        const question = this.questions.find(q => q.id === id);
        if (question) {
            this.openQuestionModal(question);
        }
    }

    openQuestionModal(question) {
        document.getElementById('questionId').value = question.id;
        document.getElementById('questionText').value = question.question_text;

        const optionsList = document.getElementById('optionsList');
        optionsList.innerHTML = '';

        question.options.forEach(opt => {
            this.addOptionInput(opt);
        });

        document.getElementById('questionModal').classList.add('active');
    }

    closeQuestionModal() {
        document.getElementById('questionModal').classList.remove('active');
    }

    addOptionInput(opt = null) {
        const container = document.getElementById('optionsList');
        const div = document.createElement('div');
        div.className = 'option-row';
        div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center;';

        div.innerHTML = `
            <input type="text" class="form-control option-label" placeholder="نص الخيار" value="${opt ? opt.option_label : ''}" style="flex: 2">
            <input type="text" class="form-control option-value" placeholder="القيمة" value="${opt ? opt.option_value : ''}" style="flex: 1">
            <input type="text" class="form-control option-icon" placeholder="أيقونة" value="${opt ? opt.option_icon : ''}" style="width: 60px; text-align: center;">
            <button type="button" class="btn btn-danger btn-sm remove-option-btn"><i class="fas fa-times"></i></button>
        `;

        div.querySelector('.remove-option-btn').addEventListener('click', () => div.remove());
        container.appendChild(div);
    }

    async saveQuestion() {
        const id = document.getElementById('questionId').value;
        const text = document.getElementById('questionText').value;

        const options = [];
        document.querySelectorAll('#optionsList .option-row').forEach(row => {
            options.push({
                option_label: row.querySelector('.option-label').value,
                option_value: row.querySelector('.option-value').value,
                option_icon: row.querySelector('.option-icon').value
            });
        });

        try {
            await API.updateQuestion(id, {
                question_text: text,
                options: options
            });

            this.showToast('تم تحديث السؤال بنجاح', 'success');
            this.closeQuestionModal();
            this.loadQuestions();
        } catch (error) {
            console.error('Error saving question:', error);
            this.showToast('حدث خطأ في حفظ السؤال', 'error');
        }
    }

    showSection(sectionName) {
        // Update nav
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
        document.getElementById(`${sectionName}-section`).classList.add('active');

        // Update title
        const titles = {
            dashboard: 'الرئيسية',
            articles: 'إدارة المقالات',
            content: 'تعديل المحتوى',
            questions: 'إدارة الأسئلة',
            settings: 'الإعدادات'
        };
        document.getElementById('pageTitle').textContent = titles[sectionName] || sectionName;
    }

    // ============ Dashboard ============
    async loadDashboard() {
        try {
            const stats = await API.getStats();
            document.getElementById('articlesCount').textContent = stats.articlesCount || 0;

            // Update other stats if elements exist
            const consultationsEl = document.querySelector('.stat-card:nth-child(2) h3');
            if (consultationsEl) consultationsEl.textContent = stats.consultationsCount || 0;

            const todayEl = document.querySelector('.stat-card:nth-child(3) h3');
            if (todayEl) todayEl.textContent = stats.todayConsultations || 0;
        } catch (error) {
            console.error('Error loading dashboard:', error);
        }
    }

    // ============ Articles Management ============
    async loadArticles() {
        const container = document.getElementById('articlesList');
        container.innerHTML = '<p style="text-align: center;">جاري التحميل...</p>';

        try {
            this.articles = await API.getArticles();
            container.innerHTML = '';

            if (this.articles.length === 0) {
                container.innerHTML = '<p style="text-align: center; color: var(--admin-text-light);">لا توجد مقالات. اضغط "إضافة مقال جديد" للبدء.</p>';
                return;
            }

            this.articles.forEach(article => {
                const item = document.createElement('div');
                item.className = 'article-item';
                item.innerHTML = `
                    <div class="article-info">
                        <h3>${article.icon || '📄'} ${article.title}</h3>
                        <div class="article-meta">
                            <span><i class="fas fa-tag"></i> ${article.category}</span>
                            <span><i class="far fa-calendar-alt"></i> ${article.date}</span>
                        </div>
                    </div>
                    <div class="article-actions">
                        <button class="btn btn-sm btn-primary" onclick="adminPanel.editArticle(${article.id})">
                            <i class="fas fa-edit"></i> تعديل
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminPanel.deleteArticle(${article.id})">
                            <i class="fas fa-trash"></i> حذف
                        </button>
                    </div>
                `;
                container.appendChild(item);
            });
        } catch (error) {
            console.error('Error loading articles:', error);
            container.innerHTML = '<p style="text-align: center; color: var(--admin-danger);">حدث خطأ في تحميل المقالات</p>';
        }
    }

    openArticleModal(article = null) {
        if (article) {
            document.getElementById('articleModalTitle').textContent = 'تعديل المقال';
            document.getElementById('articleId').value = article.id;
            document.getElementById('articleTitle').value = article.title;
            document.getElementById('articleCategory').value = article.category;
            document.getElementById('articleIcon').value = article.icon || '';
            document.getElementById('articleDate').value = article.date;
            document.getElementById('articleSummary').value = article.summary;
            // document.getElementById('articleContent').value = article.content; // Old Textarea
            this.quill.root.innerHTML = article.content; // Quill

            // Load image if exists
            if (article.image_url) {
                document.getElementById('articleImageData').value = article.image_url;
                document.getElementById('previewImg').src = article.image_url;
                document.getElementById('imagePreview').style.display = 'block';
            } else {
                this.removeImage();
            }
        } else {
            document.getElementById('articleModalTitle').textContent = 'إضافة مقال جديد';
            document.getElementById('articleForm').reset();
            document.getElementById('articleId').value = '';
            document.getElementById('articleDate').value = new Date().toISOString().split('T')[0];
            this.quill.root.innerHTML = ''; // Clear Quill
            this.quill.format('direction', 'rtl');
            this.quill.format('align', 'right');
            this.removeImage();
        }
        document.getElementById('articleModal').classList.add('active');
    }

    handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file size (2MB max)
        if (file.size > 2 * 1024 * 1024) {
            this.showToast('حجم الصورة كبير جداً. الحد الأقصى 2MB', 'error');
            e.target.value = '';
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            this.showToast('يرجى اختيار ملف صورة صحيح', 'error');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target.result;
            document.getElementById('articleImageData').value = imageData;
            document.getElementById('previewImg').src = imageData;
            document.getElementById('imagePreview').style.display = 'block';
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        document.getElementById('articleImage').value = '';
        document.getElementById('articleImageData').value = '';
        document.getElementById('previewImg').src = '';
        document.getElementById('imagePreview').style.display = 'none';
    }

    closeArticleModal() {
        document.getElementById('articleModal').classList.remove('active');
    }

    editArticle(id) {
        const article = this.articles.find(a => a.id === id);
        if (article) {
            this.openArticleModal(article);
        }
    }

    async saveArticle() {
        const id = document.getElementById('articleId').value;
        const imageData = document.getElementById('articleImageData').value;

        // Get content from Quill
        const content = this.quill.root.innerHTML;

        const articleData = {
            title: document.getElementById('articleTitle').value,
            category: document.getElementById('articleCategory').value,
            icon: document.getElementById('articleIcon').value,
            date: document.getElementById('articleDate').value,
            summary: document.getElementById('articleSummary').value,
            content: content,
            image_url: imageData || null
        };

        try {
            if (id) {
                // Update existing
                await API.updateArticle(parseInt(id), articleData);
                this.showToast('تم تحديث المقال بنجاح', 'success');
            } else {
                // Add new
                await API.createArticle(articleData);
                this.showToast('تم إضافة المقال بنجاح', 'success');
            }

            await this.loadArticles();
            await this.loadDashboard();
            this.closeArticleModal();
        } catch (error) {
            console.error('Error saving article:', error);
            this.showToast('حدث خطأ في حفظ المقال', 'error');
        }
    }

    async deleteArticle(id) {
        if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;

        try {
            await API.deleteArticle(id);
            await this.loadArticles();
            await this.loadDashboard();
            this.showToast('تم حذف المقال بنجاح', 'success');
        } catch (error) {
            console.error('Error deleting article:', error);
            this.showToast('حدث خطأ في حذف المقال', 'error');
        }
    }

    getNextArticleId() {
        return Math.max(...this.articles.map(a => a.id), 0) + 1;
    }

    saveArticlesToStorage() {
        localStorage.setItem('articles_data', JSON.stringify(this.articles));
        this.updateArticlesDataFile();
    }

    updateArticlesDataFile() {
        const jsContent = `// ============================================
// Fish Farm Consultant - Articles Data
// Auto-generated from Admin Panel
// ============================================

const ARTICLES_DATA = ${JSON.stringify(this.articles, null, 4)};`;

        // Show download link
        const blob = new Blob([jsContent], { type: 'text/javascript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'articles_data.js';
        a.click();
        URL.revokeObjectURL(url);
    }

    // ============ Content Management ============
    // ============ Content Management ============
    async loadSiteContent() {
        try {
            const content = await API.getContent();
            this.siteContent = content;

            // Site Content
            if (content.site_title) document.getElementById('siteTitle').value = content.site_title;
            if (content.hero_title) document.getElementById('heroTitle').value = content.hero_title;
            if (content.hero_description) document.getElementById('heroDescription').value = content.hero_description;
            if (content.cta_button_text) document.getElementById('ctaButtonText').value = content.cta_button_text;

            // AI Settings
            if (content.ai_provider) {
                const aiProviderSelect = document.getElementById('aiProvider');
                if (aiProviderSelect) aiProviderSelect.value = content.ai_provider;
            }
            if (content.gemini_key) document.getElementById('geminiKey').value = content.gemini_key;
            if (content.groq_key) document.getElementById('groqKey').value = content.groq_key;
            if (content.openai_key) document.getElementById('openaiKey').value = content.openai_key;
            if (content.anthropic_key) document.getElementById('anthropicKey').value = content.anthropic_key;

        } catch (error) {
            console.error('Error loading site content:', error);
            this.showToast('فشل تحميل المحتوى', 'error');
        }
    }

    async saveContent() {
        const updates = [
            // Site Content
            { key: 'site_title', value: document.getElementById('siteTitle').value },
            { key: 'hero_title', value: document.getElementById('heroTitle').value },
            { key: 'hero_description', value: document.getElementById('heroDescription').value },
            { key: 'cta_button_text', value: document.getElementById('ctaButtonText').value },

            // AI Settings
            { key: 'ai_provider', value: document.getElementById('aiProvider').value },
            { key: 'gemini_key', value: document.getElementById('geminiKey').value },
            { key: 'groq_key', value: document.getElementById('groqKey').value },
            { key: 'openai_key', value: document.getElementById('openaiKey').value },
            { key: 'anthropic_key', value: document.getElementById('anthropicKey').value }
        ];

        try {
            const promises = updates.map(item => API.updateContent(item.key, item.value));
            await Promise.all(promises);

            this.siteContent = updates.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
            this.showToast('تم حفظ الإعدادات والمحتوى بنجاح', 'success');
        } catch (error) {
            console.error('Error saving content:', error);
            this.showToast('حدث خطأ في الحفظ', 'error');
        }
    }

    async saveAISettings() {
        const aiUpdates = [
            { key: 'ai_provider', value: document.getElementById('aiProvider').value },
            { key: 'gemini_key', value: document.getElementById('geminiKey').value },
            { key: 'groq_key', value: document.getElementById('groqKey').value },
            { key: 'openai_key', value: document.getElementById('openaiKey').value },
            { key: 'anthropic_key', value: document.getElementById('anthropicKey').value }
        ];

        try {
            const promises = aiUpdates.map(item => API.updateContent(item.key, item.value));
            await Promise.all(promises);

            // Update local cache
            aiUpdates.forEach(item => {
                this.siteContent[item.key] = item.value;
            });

            this.showToast('✅ تم حفظ إعدادات الذكاء الاصطناعي بنجاح', 'success');
        } catch (error) {
            console.error('Error saving AI settings:', error);
            this.showToast('❌ حدث خطأ في حفظ إعدادات الذكاء الاصطناعي', 'error');
        }
    }

    // ============ Data Management ============
    exportData() {
        const data = {
            articles: this.articles,
            content: this.siteContent,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fish-farm-data-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast('تم تصدير البيانات بنجاح', 'success');
    }

    importData(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);

                if (data.articles) {
                    this.articles = data.articles;
                    this.saveArticlesToStorage();
                    this.loadArticles();
                }

                if (data.content) {
                    this.siteContent = data.content;
                    localStorage.setItem('site_content', JSON.stringify(data.content));
                }

                this.showToast('تم استيراد البيانات بنجاح', 'success');
                this.loadDashboard();
            } catch (error) {
                this.showToast('خطأ في قراءة الملف', 'error');
            }
        };
        reader.readAsText(file);
    }

    // ============ Utilities ============
    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');

        toast.className = 'toast ' + type;
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => toast.classList.remove('show'), 3000);
    }
}

// Initialize Admin Panel
let adminPanel;
document.addEventListener('DOMContentLoaded', () => {
    // Load articles from localStorage if available
    const savedArticles = localStorage.getItem('articles_data');
    if (savedArticles) {
        try {
            ARTICLES_DATA = JSON.parse(savedArticles);
        } catch (e) {
            console.error('Error loading saved articles:', e);
        }
    }

    adminPanel = new AdminPanel();
});
