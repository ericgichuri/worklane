import { useState, useEffect } from 'react';

export function useAuthAndSetup() {
    const [isSetup, setIsSetup] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkSystemAndAuth() {
            try {
                // 1. Check if system setup exists (/api/auth/check-setup)
                const setupRes = await fetch('/api/auth/check-setup', {
                    credentials: 'include' // Essential for Flask-Login session cookies
                });
                const setupData = await setupRes.json();

                if (setupRes.ok && setupData.success) {
                    setIsSetup(true);
                } else {
                    setIsSetup(false);
                    setIsLoading(false);
                    return; // Stop checking auth if setup isn't done yet
                }

                // 2. Check if user is logged in (/api/auth/status)
                const authRes = await fetch('/api/auth/status', {
                    credentials: 'include'
                });
                const authData = await authRes.json();
                
                // Safely read from your standard api_response structure: data -> isAuthenticated
                setIsAuthenticated(authData.data?.isAuthenticated || false);

            } catch (error) {
                console.error("Failed to connect to Flask backend", error);
            } finally {
                setIsLoading(false);
            }
        }

        checkSystemAndAuth();
    }, []);

    // Login function calls Flask backend login route
    const login = async (email, password) => {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
            credentials: 'include'
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            setIsAuthenticated(true);
        }
        return data;
    };

    // Logout function calls Flask backend logout route
    const logout = async () => {
        await fetch('/api/auth/logout', {
            method: 'POST',
            credentials: 'include'
        });
        setIsAuthenticated(false);
    };

    const completeSetup = () => {
        setIsSetup(true);
    };

    return {
        isSetup,
        isAuthenticated,
        isLoading,
        login,
        logout,
        completeSetup
    };
}