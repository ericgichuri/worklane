import { createContext, useContext } from 'react';
import { useAuthAndSetup } from '../hooks/useAuthAndSetup';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const auth = useAuthAndSetup();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}