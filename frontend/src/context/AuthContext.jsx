import { createContext, useState, useContext, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Atomic initialization from localStorage
    const [token, setToken] = useState(() => {
        const t = localStorage.getItem('token');
        console.log('🧪 Auth Bootstrap [Token]:', t ? (t.substring(0, 10) + '...') : 'MISSING');
        return t;
    });

    const [user, setUser] = useState(() => {
        try {
            const u = localStorage.getItem('user');
            console.log('🧪 Auth Bootstrap [User]:', u ? JSON.parse(u).email : 'MISSING');
            return u ? JSON.parse(u) : null;
        } catch (e) {
            console.error('Failed to parse user from localStorage', e);
            return null;
        }
    });

    const [loading, setLoading] = useState(true);

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
                            ...(JSON.parse(storedUser || '{}')),
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
                        console.warn("Invalid token detected during initAuth, logging out...");
                        logout();
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

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
