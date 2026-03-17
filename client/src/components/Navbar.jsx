import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Bell, MessageSquare, Menu } from 'lucide-react';
import { logoutUser } from '../store/authSlice';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    return (
        <nav className="bg-bg-cream border-b border-stone-200/50 pt-4 pb-4">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8">
                <div className="flex justify-between items-center h-12">
                    {/* Logo Section */}
                    <div className="flex items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-brown">
                            <path d="M12 2L2 22H5.5L12 9L18.5 22H22L12 2Z" fill="currentColor"/>
                            <path d="M6.5 17L12 6.5L17.5 17H6.5Z" fill="white" fillOpacity="0.8"/>
                        </svg>
                        <Link to="/" className="text-2xl font-playfair font-bold text-text-brown tracking-tight">
                            Artisan<span className="font-light text-muted-taupe">Connect</span>
                        </Link>
                    </div>

                    {/* Desktop Links */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link to="/" className="text-text-brown font-semibold border-b-2 border-text-brown pb-1">Home</Link>
                        <Link to="/artists" className="text-stone-600 hover:text-text-brown font-medium pb-1">Discover</Link>
                        <Link to="/community" className="text-stone-600 hover:text-text-brown font-medium pb-1">Community</Link>
                        <Link to="/about" className="text-stone-600 hover:text-text-brown font-medium pb-1">About</Link>
                        {user && (
                            <Link 
                                to={
                                    user.role === 'admin' ? "/admin-dashboard" : 
                                    user.role === 'artist' ? "/artist-dashboard" : 
                                    "/client-dashboard"
                                } 
                                className="text-stone-600 hover:text-text-brown font-medium pb-1"
                            >
                                Dashboard
                            </Link>
                        )}
                    </div>

                    {/* Right Section (Search & Profile) */}
                    <div className="hidden lg:flex items-center space-x-6">
                        {/* Search Bar */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-stone-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search artists, skills..." 
                                className="bg-stone-200/50 text-stone-700 rounded-full pl-10 pr-4 py-2 w-64 text-sm focus:outline-none focus:ring-1 focus:ring-text-brown"
                            />
                        </div>

                        {/* Icons */}
                        {user && <NotificationDropdown />}
                        
                        <button className="text-stone-600 hover:text-text-brown">
                            <MessageSquare className="h-5 w-5" />
                        </button>

                        {/* Profile/Auth */}
                        {user ? (
                            <div className="flex items-center space-x-4">
                                <Link 
                                    to={user.role === 'admin' ? "/admin-dashboard" : user.role === 'artist' ? "/artist-dashboard" : "/client-dashboard"} 
                                    className="w-10 h-10 rounded-full overflow-hidden border border-stone-200"
                                >
                                    <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} alt="Profile" className="w-full h-full object-cover bg-cat-tan" />
                                </Link>
                                <button 
                                    onClick={() => dispatch(logoutUser())}
                                    className="text-sm font-medium text-stone-500 hover:text-red-600 transition"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link to="/login" className="text-sm font-medium text-text-brown">Log in</Link>
                                <Link to="/register" className="text-sm font-medium bg-text-brown text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition">Sign up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button className="lg:hidden text-text-brown">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
