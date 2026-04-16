import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Bell, MessageSquare, Menu, X } from 'lucide-react';
import { logoutUser } from '../store/authSlice';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const { pathname } = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            navigate(`/artists?search=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const navLinks = [
        { label: 'Home', href: '/' },
        { label: 'Discover', href: '/artists' },
        { label: 'Community', href: '/community' },
        { label: 'About', href: '/about' },
    ];

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
                        {navLinks.map(({ label, href }) => {
                            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                            return (
                                <Link 
                                    key={href}
                                    to={href} 
                                    className={`font-medium pb-1 transition-colors ${
                                        isActive 
                                            ? "text-text-brown border-b-2 border-text-brown font-semibold" 
                                            : "text-stone-600 hover:text-text-brown"
                                    }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                        {user && (
                            <Link 
                                to={
                                    user.role === 'admin' ? "/admin-dashboard" : 
                                    user.role === 'artist' ? "/artist-dashboard" : 
                                    "/client-dashboard"
                                } 
                                className={`font-medium pb-1 transition-colors ${
                                    pathname.includes('dashboard') 
                                        ? "text-text-brown border-b-2 border-text-brown font-semibold" 
                                        : "text-stone-600 hover:text-text-brown"
                                }`}
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
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
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="lg:hidden text-text-brown p-2"
                    >
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Drawer */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-bg-cream border-t border-stone-200/50 animate-in slide-in-from-top duration-300">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {/* Mobile Search */}
                        <div className="relative mb-4 pt-2">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-stone-400" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Search..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleSearch}
                                className="w-full bg-stone-200/50 text-stone-700 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-text-brown"
                            />
                        </div>

                        {navLinks.map(({ label, href }) => {
                            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
                            return (
                                <Link 
                                    key={href}
                                    to={href} 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                                        isActive 
                                            ? "bg-text-brown/5 text-text-brown font-bold" 
                                            : "text-stone-600 hover:bg-stone-100"
                                    }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                        
                        {user && (
                            <>
                                <Link 
                                    to={user.role === 'admin' ? "/admin-dashboard" : user.role === 'artist' ? "/artist-dashboard" : "/client-dashboard"} 
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`block px-3 py-2 rounded-xl text-base font-medium transition-colors ${
                                        pathname.includes('dashboard') 
                                            ? "bg-text-brown/5 text-text-brown font-bold" 
                                            : "text-stone-600 hover:bg-stone-100"
                                    }`}
                                >
                                    Dashboard
                                </Link>
                                <div className="pt-4 mt-4 border-t border-stone-200/50 flex items-center justify-between px-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-200">
                                            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user.email}`} alt="Profile" className="w-full h-full object-cover bg-cat-tan" />
                                        </div>
                                        <span className="text-sm font-semibold text-text-brown">{user.fullName || user.username}</span>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            dispatch(logoutUser());
                                            setMobileMenuOpen(false);
                                        }}
                                        className="text-sm font-bold text-red-600"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </>
                        )}
                        
                        {!user && (
                            <div className="flex flex-col gap-2 pt-4 border-t border-stone-200/50">
                                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl text-sm font-bold border border-text-brown/20 text-text-brown">Log in</Link>
                                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="w-full text-center py-2.5 rounded-xl text-sm font-bold bg-text-brown text-white">Sign up</Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
