import { createContext, useState, useContext, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Atomic initialization from localStorage
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem('token');
        // Critical Fix: Check for invalid string representations of falsy values
        if (!t || t === 'false' || t === 'undefined' || t === 'null' || t === 'null' || t === '') {
            if (t && t !== '') console.warn('🧪 Auth Bootstrap [Token]: Detected invalid string value:', t);
            else console.log('🧪 Auth Bootstrap [Token]: MISSING');
            return null;
        }
        console.log('🧪 Auth Bootstrap [Token]:', t.substring(0, 10) + '...');
        return t;
    });

    const [user, setUser] = useState(() => {
        try {
            const u = localStorage.getItem('user');
            const t = localStorage.getItem('token');
            // Atomic check: If no valid token, we MUST not have a user
            if (!t || t === 'false' || t === 'undefined' || t === 'null' || t === '') {
                console.log('🧪 Auth Bootstrap [User]: Force MISSING because Token is missing/invalid');
                return null;
            }
            if (!u || u === 'undefined' || u === 'null') {
                console.log('🧪 Auth Bootstrap [User]: MISSING (Token exists but no user data)');
                return null;
            }
            const parsedUser = JSON.parse(u);
            console.log('🧪 Auth Bootstrap [User]:', parsedUser?.email || 'MISSING (Parse Error)');
            return parsedUser;
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    // Cross-check Effect: If status is inconsistent, purge everything immediately
    useEffect(() => {
        if (!loading) {
            if (token && !user) {
                console.warn("🧪 Auth Inconsistency: Token exists but no User. Purging...");
                logout();
            } else if (!token && user) {
                console.warn("🧪 Auth Inconsistency: User exists but no Token. Purging...");
                logout();
            }
        }
    }, [token, user, loading]);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                // Fetch fresh data from backend to ensure sync (credits, plan, names)
                try {
                    const res = await fetch(API_ENDPOINTS.userProfile, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        // Merge essential data
                        const updatedUser = {
                            ...(user || {}),
                            id: data.id,
                            email: data.email,
                            role: data.role,
                            plan_id: data.plan_id,
                            credits: data.credits,
                            first_name: data.first_name,
                            last_name: data.last_name,
                            customer_number: data.customer_number
                        };
                        setUser(updatedUser);
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    } else if (res.status === 401 || res.status === 403) {
                        console.warn("🧪 Auth Sync: Invalid token (401/403) during initAuth, logging out...");
                        logout();
                    } else {
                        console.error("🧪 Auth Sync: Unexpected status:", res.status);
                    }
                } catch (err) {
                    console.error("Auth sync failed", err);
                    if (err.name === 'SyntaxError') {
                        console.warn("Auth sync failed because server returned HTML instead of JSON. Check backend/nginx.");
                    }
                }
            }
            setLoading(false);
        };

        initAuth();
    }, [token]);

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        console.warn("useAuth used outside of AuthProvider! Returning fallback.");
        return { user: null, token: null, login: () => { }, logout: () => { }, loading: false };
    }
    return context;
};
