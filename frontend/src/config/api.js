// API Configuration
// Automatically uses relative URLs in production, localhost in development

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';

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
    
    // Admin
    admin: {
        users: `${API_BASE_URL}/api/admin/users`,
        userById: (id) => `${API_BASE_URL}/api/admin/users/${id}`,
        stats: `${API_BASE_URL}/api/admin/stats`,
        settings: `${API_BASE_URL}/api/admin/settings`,
        testStripe: `${API_BASE_URL}/api/admin/test-stripe`,
        plans: `${API_BASE_URL}/api/admin/plans`,
        planById: (id) => `${API_BASE_URL}/api/admin/plans/${id}`,
    }
};

// Helper function for API calls
export const apiCall = async (url, options = {}) => {
    const response = await fetch(url, options);
    return response;
};

export default API_ENDPOINTS;
