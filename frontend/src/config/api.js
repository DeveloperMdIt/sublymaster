// API Configuration
// Always use relative paths by default - works with Vite proxy in dev and same-origin in prod
// Can be overridden via environment variables for cross-origin setups
const envApiUrl = import.meta.env.VITE_API_URL || '';
// Use relative path by default unless VITE_API_URL is an absolute URL
const API_BASE_URL = (envApiUrl.startsWith('http')) ? envApiUrl : '';

export const API_ENDPOINTS = {
    // Auth
    login: `${API_BASE_URL}/api/login`,
    register: `${API_BASE_URL}/api/register`,
    
    // User
    userProfile: `${API_BASE_URL}/api/user/profile`,
    
    // Projects
    projects: `${API_BASE_URL}/api/projects`,
    projectById: (id) => `${API_BASE_URL}/api/projects/${id}`,
    
    // Templates
    templates: `${API_BASE_URL}/api/templates`,
    
    // Settings
    settings: `${API_BASE_URL}/api/settings`,
    
    // Print
    printLog: `${API_BASE_URL}/api/print/log`,
    printerFeedback: `${API_BASE_URL}/api/printer/feedback`,
    
    // History
    history: `${API_BASE_URL}/api/history`,
    transactions: `${API_BASE_URL}/api/transactions`,
    
    // Admin
    admin: {
        users: `${API_BASE_URL}/api/admin/users`,
        userById: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
        stats: `${API_BASE_URL}/api/admin/stats`,
        settings: `${API_BASE_URL}/api/admin/settings`,
        plans: `${API_BASE_URL}/api/admin/plans`,
        planById: (id) => `${API_BASE_URL}/api/admin/plans/${id}`,
        templates: `${API_BASE_URL}/api/admin/templates`,
        templateById: (id) => `${API_BASE_URL}/api/admin/templates/${id}`,
        promoteTemplate: `${API_BASE_URL}/api/admin/templates/promote`,
        emailTemplates: `${API_BASE_URL}/api/admin/email-templates`,
        emailTemplateByType: (type) => `${API_BASE_URL}/api/admin/email-templates/${type}`,
        testEmail: `${API_BASE_URL}/api/admin/email-templates/test`,
        testStripe: `${API_BASE_URL}/api/admin/test-stripe`,
        deploy: `${API_BASE_URL}/api/admin/deploy`,
        deployments: `${API_BASE_URL}/api/admin/deployments`,
    }
};

// Helper function for API calls
export const apiCall = async (url, options = {}) => {
    const response = await fetch(url, options);
    return response;
};

export default API_ENDPOINTS;
