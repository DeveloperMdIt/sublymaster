import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            if (token) {
                // Try to load from local storage first for speed
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    setUser(JSON.parse(storedUser));
                }

                // Then fetch fresh data from backend to ensure sync (credits, plan, names)
                try {
                    const res = await fetch('/api/user/profile', {
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
