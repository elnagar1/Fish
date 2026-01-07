// ============================================
// Fish Farm Consultant - Main Application
// Version 3.0 - Clean & Database Integrated
// ============================================
// CONFIG is loaded from config.js


class FishFarmConsultant {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 0; // Will be set after loading questions
        this.questionsData = [];
        this.answers = {};
        this.siteContent = {}; // Cache for site settings

        // API Settings (Initialized empty, loaded from DB)
        this.currentProvider = CONFIG.DEFAULT_PROVIDER;
        this.apiKeys = {};
        this.temperature = CONFIG.MODEL_SETTINGS.temperature;

        // Initialize App
        this.init();
    }

    async init() {
        console.log('🚀 Initializing Application...');

        try {
            // 1. Load Settings & Keys from DB
            await this.loadSiteContent();

            // 2. Load Content
            await Promise.all([
                this.renderArticles(),
                this.renderDynamicQuestions()
            ]);

            // 3. Bind Events
            this.bindEvents();

            console.log('✅ Initialization Complete');
        } catch (error) {
            console.error('❌ Initialization Error:', error);
            this.showToast('حدث خطأ أثناء تشغيل الموقع. يرجى تحديث الصفحة.', 'error');
        }
    }

    // ============ Data Loading ============

    async loadSiteContent() {
        console.log('📥 Loading Site Content...');
        try {
            const content = await API.getContent();
            this.siteContent = content;

            // Load API Keys
            this.apiKeys = {
                gemini: content.gemini_key || '',
                groq: content.groq_key || '',
                openai: content.openai_key || '',
                anthropic: content.anthropic_key || ''
            };

            // Set Provider
            if (content.ai_provider && CONFIG.AI_PROVIDERS[content.ai_provider]) {
                this.currentProvider = content.ai_provider;
            }

            // Update UI with Provider Info
            const provider = CONFIG.AI_PROVIDERS[this.currentProvider];
            const statusIcon = document.getElementById('statusIcon');
            const providerName = document.getElementById('currentProviderName');

            if (statusIcon) statusIcon.textContent = provider.icon;
            if (providerName) providerName.textContent = provider.name;

            // Load saved temperature if available
            if (content.ai_temperature) {
                this.temperature = parseFloat(content.ai_temperature);
            }

            console.log('✅ Content Loaded. Provider:', this.currentProvider);
        } catch (error) {
            console.error('❌ Error loading content:', error);
        }
    }

    async renderArticles() {
        console.log('📥 Loading Articles...');
        const grid = document.getElementById('articlesGrid');
        if (!grid) return;

        try {
            const articles = await API.getArticles();
            grid.innerHTML = '';

            if (!articles || articles.length === 0) {
                grid.innerHTML = '<p class="text-center text-muted">لا توجد مقالات حالياً</p>';
                return;
            }

            const articlesToShow = articles.slice(0, 3); // Show first 3

            articlesToShow.forEach(article => {
                const card = document.createElement('div');
                card.className = 'article-card';

                const imageContent = article.image_url
                    ? `<img src="${article.image_url}" alt="${article.title}" class="article-img">`
                    : `<div class="article-icon">${article.icon || '📄'}</div>`;

                card.innerHTML = `
                    <div class="article-image-wrapper">${imageContent}</div>
                    <div class="article-content">
                        <div class="article-date"><i class="far fa-calendar-alt"></i> ${article.date}</div>
                        <h3 class="article-title">${article.title}</h3>
                        <p class="article-summary">${article.summary}</p>
                        <a href="article.html#${article.id}" class="read-more-btn">اقرأ المزيد <i class="fas fa-arrow-left"></i></a>
                    </div>
                `;
                grid.appendChild(card);
            });


            // Show 'Load More' button if there are more articles
            const loadMoreBtn = document.getElementById('loadMoreArticles');
            if (loadMoreBtn) {
                loadMoreBtn.style.display = articles.length > 3 ? 'inline-flex' : 'none';
            }


            console.log(`✅ Loaded ${articles.length} Articles`);
        } catch (error) {
            console.error('❌ Error rendering articles:', error);
            grid.innerHTML = '<p class="text-center error">فشل تحميل المقالات</p>';
        }
    }

    async renderDynamicQuestions() {
        console.log('📥 Loading Questions...');
        try {
            const questions = await API.getQuestions();

            // Remove loading
            const loadingEl = document.querySelector('.loading-questions');
            if (loadingEl) loadingEl.remove();

            if (!questions || questions.length === 0) {
                const wrapper = document.querySelector('.questions-wrapper');
                if (wrapper) wrapper.innerHTML = '<p class="text-center">لم يتم العثور على أسئلة</p>';
                return;
            }

            this.questionsData = questions;
            this.totalQuestions = questions.length;

            // 1. Render Progress Steps
            const progressSteps = document.querySelector('.progress-steps');
            if (progressSteps) {
                progressSteps.innerHTML = questions.map((_, index) =>
                    `<div class="step ${index === 0 ? 'active' : ''}">${index + 1}</div>`
                ).join('');
            }

            // 2. Render Questions Inputs
            const wrapper = document.querySelector('.questions-wrapper');
            if (wrapper) {
                wrapper.innerHTML = questions.map((q, index) => {
                    const isActive = index === 0 ? 'active' : '';
                    let inputHtml = '';

                    if (q.question_type === 'text' || q.question_type === 'textarea') {
                        inputHtml = `
                            <div class="textarea-wrapper">
                                <textarea name="q_${q.id}" class="dynamic-input" rows="5" placeholder="اكتب إجابتك هنا..."></textarea>
                            </div>`;
                    } else {
                        // Options
                        const optionsHtml = q.options.map(opt => `
                            <label class="option-card">
                                <input type="radio" name="q_${q.id}" value="${opt.option_value}" class="dynamic-input">
                                <div class="option-content">
                                    <span class="option-icon">${opt.option_icon || '🔹'}</span>
                                    <span class="option-text">${opt.option_label}</span>
                                </div>
                            </label>
                        `).join('');
                        const gridClass = q.options.length > 4 ? 'options-grid' : 'options-grid vertical';
                        inputHtml = `<div class="${gridClass}">${optionsHtml}</div>`;
                    }

                    return `
                        <div class="question-card ${isActive}" id="question${index + 1}" data-id="${q.id}">
                            <div class="question-icon">❓</div>
                            <h3 class="question-title">${q.question_text}</h3>
                            ${inputHtml}
                        </div>
                    `;
                }).join('');
            }

            this.updateProgress();
            this.updateButtons();

            // Re-bind input events for new elements
            this.bindInputEvents();

            console.log(`✅ Loaded ${questions.length} Questions`);
        } catch (error) {
            console.error('❌ Error rendering questions:', error);
        }
    }

    // ============ Event Handling ============

    bindEvents() {
        // Navigation Buttons
        document.getElementById('nextBtn')?.addEventListener('click', () => this.nextQuestion());
        document.getElementById('prevBtn')?.addEventListener('click', () => this.prevQuestion());

        // Action Buttons
        document.getElementById('submitBtn')?.addEventListener('click', () => this.submitConsultation());
        document.getElementById('newConsultBtn')?.addEventListener('click', () => this.resetConsultation());
        document.getElementById('printBtn')?.addEventListener('click', () => this.printResult());
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyResult());
        document.getElementById('retryBtn')?.addEventListener('click', () => this.submitConsultation());

        // Keyboard Navigation (Enter/Esc)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeArticleModal();
        });

        // Article Modal
        document.getElementById('closeArticleModal')?.addEventListener('click', () => this.closeArticleModal());
        document.querySelector('#articleModal .modal-overlay')?.addEventListener('click', () => this.closeArticleModal());
    }

    bindInputEvents() {
        document.querySelectorAll('.dynamic-input').forEach(input => {
            input.addEventListener('change', () => {
                this.answers[input.name] = input.value;
                this.updateButtons(); // Updates button state based on answer
            });

            if (input.tagName === 'TEXTAREA') {
                input.addEventListener('input', () => {
                    this.answers[input.name] = input.value;
                });
            }
        });
    }

    // ============ Navigation Logic ============

    nextQuestion() {
        if (this.currentQuestion < this.totalQuestions) {
            if (!this.validateCurrentQuestion()) {
                this.showToast('يرجى الإجابة على السؤال الحالي', 'warning');
                return;
            }
            this.showQuestion(this.currentQuestion + 1);
        }
    }

    prevQuestion() {
        if (this.currentQuestion > 1) {
            this.showQuestion(this.currentQuestion - 1);
        }
    }

    showQuestion(num) {
        // Hide all
        document.querySelectorAll('.question-card').forEach(c => c.classList.remove('active'));
        document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));

        // Show current
        this.currentQuestion = num;
        document.getElementById(`question${num}`).classList.add('active');

        // Update steps
        const steps = document.querySelectorAll('.step');
        for (let i = 0; i < num; i++) {
            steps[i].classList.add('active');
        }

        this.updateButtons();
        this.updateProgress();
    }

    updateButtons() {
        // Visibility
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) prevBtn.style.display = this.currentQuestion === 1 ? 'none' : 'inline-flex';

        if (this.currentQuestion === this.totalQuestions) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'inline-flex';
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-flex';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    updateProgress() {
        const progress = ((this.currentQuestion - 1) / (this.totalQuestions - 1)) * 100;
        const bar = document.querySelector('.progress-fill');
        if (bar) bar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    validateCurrentQuestion() {
        const currentCard = document.getElementById(`question${this.currentQuestion}`);
        const inputs = currentCard.querySelectorAll('.dynamic-input');

        // Optional Question Check (TextArea usually optional, but let's assume Radio is required)
        const isRadio = currentCard.querySelector('input[type="radio"]');
        if (isRadio) {
            const checked = currentCard.querySelector('input[type="radio"]:checked');
            return !!checked;
        }
        return true; // Text inputs optional by default in this logic
    }

    // ============ AI Consultation Logic ============

    collectAnswers() {
        // Ensure state is up to date
        document.querySelectorAll('.dynamic-input').forEach(input => {
            if (input.type === 'radio' && input.checked) {
                this.answers[input.name] = input.value;
            } else if (input.tagName === 'TEXTAREA' || input.type === 'text') {
                this.answers[input.name] = input.value;
            }
        });
        return this.answers;
    }

    buildPrompt(answers) {
        let promptText = "أنا صاحب مزرعة سمكية وأحتاج استشارتك المتخصصة بناءً على التفاصيل التالية:\n\n";

        if (this.questionsData) {
            this.questionsData.forEach(q => {
                const key = `q_${q.id}`;
                const answer = answers[key] || 'غير محدد';
                promptText += `**${q.question_text}:** ${answer}\n`;
            });
        }

        promptText += `\n---\n
يرجى تقديم استشارة شاملة ودقيقة تتضمن:
1. **تحليل الوضع الحالي**
2. **التوصيات الفنية والعملية**
3. **خطة عمل مقترحة**
4. **نصائح وقائية**
5. **تحذيرات أو مخاطر محتملة**

الرد يجب أن يكون باللغة العربية، منسق بشكل جيد، واحترافي.`;
        return promptText;
    }

    async submitConsultation() {
        const apiKey = this.apiKeys[this.currentProvider];
        const provider = CONFIG.AI_PROVIDERS[this.currentProvider];

        // Validation
        if (!apiKey) {
            this.showToast(`عفواً، لم يتم إعداد مفتاح API الخاص بـ ${provider.name}. يرجى إضافته من لوحة التحكم.`, 'error');
            return;
        }

        const answers = this.collectAnswers();
        console.log('📝 Answers:', answers);

        // UI Transition
        this.toggleLoadingForConsultation(true);

        try {
            console.log(`🚀 Calling AI Provider: ${this.currentProvider}`);
            const response = await this.callAI(answers);

            console.log('✅ Response Received');
            this.displayResult(response);

            // Background Save
            API.saveConsultation(answers, response, this.currentProvider).catch(e => console.error('Save failed', e));

        } catch (error) {
            console.error('❌ Consultation Error:', error);
            this.displayError(error.message);
            this.toggleLoadingForConsultation(false, true); // Show error state
        }
    }

    toggleLoadingForConsultation(isLoading, showRetry = false) {
        const consultContainer = document.querySelector('.consult-container');
        const resultContainer = document.getElementById('resultContainer');
        const loadingState = document.getElementById('loadingState');
        const errorState = document.getElementById('errorState');
        const resultDiv = document.getElementById('consultationResult');

        if (isLoading) {
            consultContainer.style.display = 'none';
            resultContainer.style.display = 'block';
            loadingState.style.display = 'block';
            errorState.style.display = 'none';
            resultDiv.style.display = 'none';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        } else if (showRetry) {
            loadingState.style.display = 'none';
            errorState.style.display = 'block';
        } else {
            // Success state handling is done in displayResult
        }
    }

    async callAI(answers) {
        const prompt = this.buildPrompt(answers);
        const apiKey = this.apiKeys[this.currentProvider];
        const provider = CONFIG.AI_PROVIDERS[this.currentProvider];

        switch (this.currentProvider) {
            case 'gemini': return await this.callGemini(prompt, apiKey, provider);
            case 'groq': return await this.callGroq(prompt, apiKey, provider);
            case 'openai': return await this.callOpenAI(prompt, apiKey, provider);
            case 'anthropic': return await this.callAnthropic(prompt, apiKey, provider);
            // Add others as needed
            default: throw new Error(`المزود '${this.currentProvider}' غير مدعوم حالياً`);
        }
    }

    // ============ Provider Implementations ============

    async callGroq(prompt, apiKey, provider) {
        const response = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    { role: 'system', content: CONFIG.SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                temperature: this.temperature,
                max_tokens: CONFIG.MODEL_SETTINGS.maxOutputTokens
            })
        });

        if (!response.ok) throw new Error(`Groq API Error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'No response';
    }

    async callGemini(prompt, apiKey, provider) {
        const url = `${provider.url}?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: this.temperature,
                    maxOutputTokens: CONFIG.MODEL_SETTINGS.maxOutputTokens
                },
                systemInstruction: { parts: [{ text: CONFIG.SYSTEM_PROMPT }] }
            })
        });

        if (!response.ok) throw new Error(`Gemini API Error: ${response.status}`);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    }

    async callOpenAI(prompt, apiKey, provider) {
        const response = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [
                    { role: 'system', content: CONFIG.SYSTEM_PROMPT },
                    { role: 'user', content: prompt }
                ],
                temperature: this.temperature
            })
        });

        if (!response.ok) throw new Error(`OpenAI API Error: ${response.status}`);
        const data = await response.json();
        return data.choices?.[0]?.message?.content || 'No response';
    }

    async callAnthropic(prompt, apiKey, provider) {
        const response = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: provider.model,
                messages: [{ role: 'user', content: prompt }],
                max_tokens: CONFIG.MODEL_SETTINGS.maxOutputTokens,
                system: CONFIG.SYSTEM_PROMPT
            })
        });

        if (!response.ok) throw new Error(`Anthropic API Error: ${response.status}`);
        const data = await response.json();
        return data.content?.[0]?.text || 'No response';
    }

    // ============ Result Display ============

    displayResult(markdown) {
        const resultDiv = document.getElementById('consultationResult');
        const contentDiv = document.getElementById('resultContent');
        const loadingState = document.getElementById('loadingState');

        loadingState.style.display = 'none';
        resultDiv.style.display = 'block';

        // Basic Markdown Conversion
        let html = markdown
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>') // Numbered lists
            .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>') // Bullet lists
            .replace(/\n/gim, '<br>');

        // Wrap lists (simplified)
        if (html.includes('<li>')) {
            // This is a very basic wrapper, might need regex improvement for nested lists
            // but is cleaner than the old mess.
            // For robust md, a library like marked.js is recommended, but we stick to vanilla for now.
            html = html.replace(/(<li>.*?<\/li>)+/gs, '<ul>$&</ul>');
        }

        contentDiv.innerHTML = html;
        document.getElementById('resultContainer').scrollIntoView({ behavior: 'smooth' });
    }

    displayError(message) {
        const msgEl = document.getElementById('errorMessage');
        if (msgEl) msgEl.textContent = message;
    }

    // ============ Utilities ============

    resetConsultation() {
        this.currentQuestion = 1;
        this.answers = {};

        // Reset Inputs
        document.querySelectorAll('.dynamic-input').forEach(input => {
            if (input.type === 'radio' || input.type === 'checkbox') input.checked = false;
            else input.value = '';
        });

        // UI Reset
        document.querySelector('.consult-container').style.display = 'block';
        document.getElementById('resultContainer').style.display = 'none';

        this.showQuestion(1);
    }

    printResult() {
        window.print();
    }

    async copyResult() {
        const content = document.getElementById('resultContent').innerText;
        try {
            await navigator.clipboard.writeText(content);
            this.showToast('تم نسخ الاستشارة للحافظة', 'success');
        } catch (err) {
            this.showToast('فشل النسخ', 'error');
        }
    }

    closeArticleModal() {
        document.getElementById('articleModal')?.classList.remove('active');
    }

    showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (!toast) return;

        toast.textContent = message;
        toast.className = `toast toast-${type} show`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Start Application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new FishFarmConsultant();
});
