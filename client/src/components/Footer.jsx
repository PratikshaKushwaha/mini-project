import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-deep-cocoa text-soft-peach">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 py-14">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

                    {/* Brand */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-soft-peach">
                                <path d="M12 2L2 22H5.5L12 9L18.5 22H22L12 2Z" fill="currentColor"/>
                                <path d="M6.5 17L12 6.5L17.5 17H6.5Z" fill="white" fillOpacity="0.4"/>
                            </svg>
                            <span className="text-xl font-playfair font-bold tracking-tight">
                                Artisan<span className="font-light opacity-70">Connect</span>
                            </span>
                        </div>
                        <p className="text-sm leading-relaxed opacity-70 max-w-xs">
                            Connecting creative artists with clients who value handcrafted work. Built with love for the artisan community.
                        </p>
                    </div>

                    {/* Explore */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 opacity-50">Explore</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/artists" className="opacity-70 hover:opacity-100 transition">Browse Artists</Link></li>
                            <li><Link to="/artists?category=Illustration" className="opacity-70 hover:opacity-100 transition">Illustration</Link></li>
                            <li><Link to="/artists?category=Photography" className="opacity-70 hover:opacity-100 transition">Photography</Link></li>
                            <li><Link to="/artists?category=Mehendi" className="opacity-70 hover:opacity-100 transition">Mehendi</Link></li>
                            <li><Link to="/artists?category=Digital Art" className="opacity-70 hover:opacity-100 transition">Digital Art</Link></li>
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 opacity-50">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/about" className="opacity-70 hover:opacity-100 transition">About Us</Link></li>
                            <li><Link to="/community" className="opacity-70 hover:opacity-100 transition">Community</Link></li>
                            <li><Link to="/register?role=artist" className="opacity-70 hover:opacity-100 transition">Become an Artist</Link></li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div>
                        <h4 className="font-semibold text-sm uppercase tracking-widest mb-4 opacity-50">Account</h4>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/login" className="opacity-70 hover:opacity-100 transition">Log In</Link></li>
                            <li><Link to="/register" className="opacity-70 hover:opacity-100 transition">Sign Up</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-muted-taupe/20 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs opacity-50">
                    <p>© {year} ArtisanConnect. All rights reserved.</p>
                    <p>Made with ♥ for artists everywhere.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
