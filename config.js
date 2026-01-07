// ============================================
// Fish Farm Consultant - Configuration File
// Version 2.2 - Fixed Free Options
// ============================================

const CONFIG = {
    // ============================================
    // AI Providers Configuration
    // ============================================

    // Available AI Providers
    AI_PROVIDERS: {
        // ========== RECOMMENDED - EASY TO GET FREE KEY ==========

        // Groq (Free and Fast) - RECOMMENDED!
        groq: {
            name: '⚡ Groq (موصى به)',
            description: '🎯 سريع جداً ومجاني - احصل على المفتاح في ثوانٍ!',
            url: 'https://api.groq.com/openai/v1/chat/completions',
            model: 'llama-3.3-70b-versatile',
            requiresKey: true,
            keyUrl: 'https://console.groq.com/keys',
            icon: '⚡',
            recommended: true
        },

        // Google Gemini (Free with API Key)
        gemini: {
            name: 'Google Gemini',
            description: 'نموذج Google الذكي - مجاني مع مفتاح API',
            url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
            requiresKey: true,
            keyUrl: 'https://makersuite.google.com/app/apikey',
            icon: '🔮'
        },

        // Hugging Face (Free)
        huggingface: {
            name: 'Hugging Face',
            description: 'نماذج مفتوحة المصدر مجانية',
            url: 'https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1',
            requiresKey: true,
            keyUrl: 'https://huggingface.co/settings/tokens',
            icon: '🤗'
        },

        // OpenRouter (Access to free models)
        openrouter: {
            name: 'OpenRouter',
            description: 'وصول لنماذج متعددة مجانية',
            url: 'https://openrouter.ai/api/v1/chat/completions',
            model: 'meta-llama/llama-3.2-3b-instruct:free',
            requiresKey: true,
            keyUrl: 'https://openrouter.ai/keys',
            icon: '🌐'
        },

        // Cohere (Free tier available)
        cohere: {
            name: 'Cohere',
            description: 'نموذج Command - مجاني للتجربة',
            url: 'https://api.cohere.ai/v1/chat',
            model: 'command',
            requiresKey: true,
            keyUrl: 'https://dashboard.cohere.com/api-keys',
            icon: '🧠'
        }
    },

    // Default provider (Groq is easiest to get started)
    DEFAULT_PROVIDER: 'groq',

    // ============================================
    // Model Settings
    // ============================================
    MODEL_SETTINGS: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
    },

    // ============================================
    // System Prompt
    // ============================================
    SYSTEM_PROMPT: `أنت خبير استشاري متخصص في مزارع الأسماك والاستزراع السمكي. 
لديك خبرة واسعة في:
- إدارة المزارع السمكية
- جودة المياه ومعالجتها
- تغذية الأسماك والأعلاف
- الأمراض الشائعة وعلاجها
- تحسين الإنتاجية
- أنظمة التهوية والفلترة
- اختيار أنواع الأسماك المناسبة
- الجدوى الاقتصادية للمشاريع

قدم نصائح عملية ومفصلة باللغة العربية. كن ودوداً ومحترفاً.
اعتمد على المعلومات المقدمة من المستخدم لتقديم استشارة مخصصة.
قم بتنظيم ردك بشكل واضح مع عناوين وقوائم.`,

    // ============================================
    // Application Settings
    // ============================================
    APP_NAME: 'مستشار مزارع الأسماك',
    APP_VERSION: '2.2.0',

    // Help URLs
    HELP_URLS: {
        groq: 'https://console.groq.com/keys',
        gemini: 'https://makersuite.google.com/app/apikey',
        huggingface: 'https://huggingface.co/settings/tokens',
        openrouter: 'https://openrouter.ai/keys',
        cohere: 'https://dashboard.cohere.com/api-keys'
    }
};

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
