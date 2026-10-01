import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Setup from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Navbar from "./components/Navbar";
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Footer from './components/Footer';

function App() {
    const { isSetup, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-background text-primary">
                <p className="text-lg font-medium animate-pulse">Loading Worklane...</p>
            </div>
        );
    }

    if (!isSetup) {
        return (
            <div className="h-full flex flex-col overflow-hidden">
                <Navbar />
                <div className="flex-1 overflow-y-auto">
                    <Routes>
                        <Route path="*" element={<Setup />} />
                    </Routes>
                    <Footer />
                </div>
                
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col overflow-hidden">
            <Navbar />
            <div className="flex-1 overflow-y-auto">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route 
                        path="/login" 
                        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
                    />
                    <Route path="/setup" element={<Navigate to="/login" replace />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />
      
                    <Route 
                        path="/dashboard" 
                        element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />} 
                    />

                    <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
                    
                </Routes>
                <Footer />
            </div>
        </div>
    );
}

export default App;