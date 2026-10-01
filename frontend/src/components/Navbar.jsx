import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            if (isAuthenticated) {
                try {
                    const response = await fetch('/api/auth/me', {
                        credentials: 'include'
                    });
                    const results = await response.json();
                    if (response.ok && results.success) {
                        setUser(results.data);
                    }
                } catch (error) {
                    console.error("Failed to fetch user profile", error);
                }
            } else {
                setUser(null);
            }
        };

        fetchUserData();
    }, [isAuthenticated]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogoutClick = () => {
        setDropdownOpen(false);
        setShowConfirm(true);
    };

    const confirmLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            setShowConfirm(false);
            navigate('/login', { replace: true });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <>
            <nav className="flex justify-between items-center h-[12vh] px-3 md:px-6 bg-background text-primary shadow-sm border-b border-primary/10 sticky top-0 z-50">
                
                <Link to="/" className="flex gap-3 items-center group">
                    <img src="/worklane.svg" alt="Worklane Logo" className="h-10 w-10 object-contain" />
                    <span className="text-xl font-black tracking-tight text-primary">
                        WORK<span className="text-accent">LANE</span>
                    </span>
                </Link>

                {/* Navigation Actions */}
                <div className="flex items-center gap-3">
                    {isAuthenticated ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(!dropdownOpen)}
                                className="flex items-center gap-2.5 text-sm font-semibold px-3 py-2 rounded-xl text-primary hover:bg-primary/5 transition-all duration-200 cursor-pointer"
                            >
                                <div className="w-7 h-7 rounded-full bg-accent/10 text-accent flex items-center justify-center text-xs">
                                    <i className="fas fa-user"></i>
                                </div>
                                <span className="hidden sm:inline max-w-[120px] truncate">
                                    {user ? user.name : 'Account'}
                                </span>
                                <i className={`fas fa-chevron-down text-xs transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}></i>
                            </button>

                            {dropdownOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-primary/10 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="px-4 py-2 border-b border-primary/5">
                                        <p className="text-xs text-primary/60">Signed in as</p>
                                        <p className="text-sm font-bold text-primary truncate">{user ? user.email : 'User'}</p>
                                    </div>

                                    <Link
                                        to="/profile"
                                        onClick={() => setDropdownOpen(false)}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        <i className="fas fa-id-card text-accent w-4 text-center"></i>
                                        Profile
                                    </Link>

                                    <button
                                        onClick={handleLogoutClick}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left"
                                    >
                                        <i className="fas fa-sign-out-alt w-4 text-center"></i>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Sign In Button */
                        <Link 
                            to="/login" 
                            className="bg-accent text-background text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md hover:opacity-95 transition-all duration-200 cursor-pointer inline-block"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            </nav>

            {/* Logout Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs px-4">
                    <div className="bg-white rounded-2xl shadow-2xl border border-primary/10 max-w-sm w-full p-6 space-y-4 animate-in fade-in zoom-in duration-150">
                        <div className="space-y-1 text-center">
                            <h3 className="text-lg font-bold text-primary">Confirm Logout</h3>
                            <p className="text-sm text-primary/70">
                                Are you sure you want to log out of your WORKLANE account?
                            </p>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-primary/20 text-primary font-semibold text-sm hover:bg-primary/5 transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                disabled={isLoggingOut}
                                onClick={confirmLogout}
                                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm shadow-md hover:bg-red-700 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isLoggingOut ? 'Logging out...' : 'Yes, Logout'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default Navbar;