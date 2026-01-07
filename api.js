// ============================================
// API Helper - Frontend to Backend Communication
// ============================================

// Auto-detect API URL
const currentHost = window.location.hostname || 'localhost';
let API_BASE_URL = `http://${currentHost}:3001/api`;

// Force localhost if running from file system
if (window.location.protocol === 'file:') {
    API_BASE_URL = 'http://localhost:3001/api';
}

console.log('🔗 API Base URL:', API_BASE_URL);

console.log('🔗 API Base URL:', API_BASE_URL);
console.log('📍 Current Location:', window.location.href);

class API {
    // ============ Articles ============

    static async getArticles() {
        try {
            const response = await fetch(`${API_BASE_URL}/articles`);
            if (!response.ok) throw new Error('Failed to fetch articles');
            return await response.json();
        } catch (error) {
            console.error('Error fetching articles:', error);
            return [];
        }
    }

    static async getArticle(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${id}`);
            if (!response.ok) throw new Error('Failed to fetch article');
            return await response.json();
        } catch (error) {
            console.error('Error fetching article:', error);
            return null;
        }
    }

    static async createArticle(articleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/articles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData)
            });
            if (!response.ok) throw new Error('Failed to create article');
            return await response.json();
        } catch (error) {
            console.error('Error creating article:', error);
            throw error;
        }
    }

    static async updateArticle(id, articleData) {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articleData)
            });
            if (!response.ok) throw new Error('Failed to update article');
            return await response.json();
        } catch (error) {
            console.error('Error updating article:', error);
            throw error;
        }
    }

    static async deleteArticle(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete article');
            return await response.json();
        } catch (error) {
            console.error('Error deleting article:', error);
            throw error;
        }
    }

    // ============ Site Content ============

    static async getContent() {
        try {
            const response = await fetch(`${API_BASE_URL}/content`);
            if (!response.ok) throw new Error('Failed to fetch content');
            return await response.json();
        } catch (error) {
            console.error('Error fetching content:', error);
            return {};
        }
    }

    static async updateContent(key, value) {
        try {
            const response = await fetch(`${API_BASE_URL}/content/${key}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ value })
            });
            if (!response.ok) throw new Error('Failed to update content');
            return await response.json();
        } catch (error) {
            console.error('Error updating content:', error);
            throw error;
        }
    }

    // ============ Questions ============

    static async getQuestions() {
        try {
            const response = await fetch(`${API_BASE_URL}/questions`);
            if (!response.ok) throw new Error('Failed to fetch questions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching questions:', error);
            return [];
        }
    }

    static async updateQuestion(id, data) {
        try {
            const response = await fetch(`${API_BASE_URL}/questions/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Failed to update question');
            return await response.json();
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    }

    // ============ Consultations ============

    static async saveConsultation(answers, aiResponse, provider) {
        try {
            const response = await fetch(`${API_BASE_URL}/consultations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    answers,
                    ai_response: aiResponse,
                    provider
                })
            });
            if (!response.ok) throw new Error('Failed to save consultation');
            return await response.json();
        } catch (error) {
            console.error('Error saving consultation:', error);
            // Don't throw - consultation saving is not critical
            return null;
        }
    }

    static async getConsultations(limit = 50) {
        try {
            const response = await fetch(`${API_BASE_URL}/consultations?limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch consultations');
            return await response.json();
        } catch (error) {
            console.error('Error fetching consultations:', error);
            return [];
        }
    }

    // ============ Statistics ============

    static async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/stats`);
            if (!response.ok) throw new Error('Failed to fetch stats');
            return await response.json();
        } catch (error) {
            console.error('Error fetching stats:', error);
            return {
                articlesCount: 0,
                consultationsCount: 0,
                todayConsultations: 0
            };
        }
    }
}
