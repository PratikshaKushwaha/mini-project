import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const PublicNavbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { pathname } = useLocation();

    const navLinks = [
        { label: 'Home',      href: '/' },
        { label: 'Discover',  href: '/artists' },
        { label: 'Community', href: '/community' },
        { label: 'About',     href: '/about' },
    ];

    return (
        <nav className="bg-bg-cream border-b border-stone-200/60 py-4">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8">
                <div className="flex justify-between items-center h-12">

                    {/* Logo */}
                    <div className="flex items-center gap-2">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-brown">
                            <path d="M12 2L2 22H5.5L12 9L18.5 22H22L12 2Z" fill="currentColor"/>
                            <path d="M6.5 17L12 6.5L17.5 17H6.5Z" fill="white" fillOpacity="0.8"/>
                        </svg>
                        <Link to="/" className="text-2xl font-playfair font-bold text-text-brown tracking-tight">
                            Artisan<span className="font-light text-muted-taupe">Connect</span>
                        </Link>
                    </div>

                    {/* Desktop Nav Links */}
                    <div className="hidden lg:flex items-center space-x-8">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                to={href}
                                className={`font-medium pb-1 transition-colors ${
                                    pathname === href
                                        ? 'text-text-brown border-b-2 border-text-brown font-semibold'
                                        : 'text-stone-600 hover:text-text-brown'
                                }`}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop Auth Buttons */}
                    <div className="hidden lg:flex items-center space-x-3">
                        <Link
                            to="/login"
                            className="text-sm font-medium text-text-brown px-5 py-2 rounded-full border border-text-brown/20 hover:border-text-brown transition"
                        >
                            Log in
                        </Link>
                        <Link
                            to="/register"
                            className="text-sm font-medium bg-text-brown text-white px-5 py-2 rounded-full hover:bg-opacity-90 transition"
                        >
                            Sign up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden text-text-brown"
                        onClick={() => setMobileOpen(prev => !prev)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Mobile Dropdown */}
                {mobileOpen && (
                    <div className="lg:hidden mt-4 pb-4 border-t border-stone-200/60 pt-4 space-y-3">
                        {navLinks.map(({ label, href }) => (
                            <Link
                                key={href}
                                to={href}
                                onClick={() => setMobileOpen(false)}
                                className={`block font-medium py-1 ${pathname === href ? 'text-text-brown font-semibold' : 'text-stone-600 hover:text-text-brown'}`}
                            >
                                {label}
                            </Link>
                        ))}
                        <div className="flex gap-3 pt-2">
                            <Link
                                to="/login"
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium text-text-brown px-5 py-2 rounded-full border border-text-brown/20 hover:border-text-brown transition"
                            >
                                Log in
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setMobileOpen(false)}
                                className="text-sm font-medium bg-text-brown text-white px-5 py-2 rounded-full hover:bg-opacity-90 transition"
                            >
                                Sign up
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default PublicNavbar;
