import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';

const NotFound = () => {
    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
            <div className="relative mb-8">
                <h1 className="text-[12rem] font-playfair font-black text-stone-200 leading-none select-none">
                    404
                </h1>
                <div className="absolute inset-0 flex items-center justify-center mt-8">
                    <div className="bg-bg-cream px-6 py-2 border border-warm-stone/20 rounded-full shadow-sm">
                        <p className="text-xl font-bold text-text-brown tracking-widest uppercase">Page Not Found</p>
                    </div>
                </div>
            </div>
            
            <p className="text-stone-500 max-w-md mb-10 text-lg">
                The piece you're looking for doesn't exist in our collection, or it's been moved to a different gallery.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/">
                    <Button icon={<Home className="w-4 h-4" />} className="px-8 shadow-lg">
                        Back to Home
                    </Button>
                </Link>
                <button 
                    onClick={() => window.history.back()}
                    className="flex items-center justify-center gap-2 text-stone-600 hover:text-text-brown font-semibold transition py-3 px-8"
                >
                    <ArrowLeft className="w-4 h-4" /> Go Back
                </button>
            </div>

            <div className="mt-20 opacity-20 filter grayscale">
                 <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-text-brown">
                    <path d="M12 2L2 22H5.5L12 9L18.5 22H22L12 2Z" fill="currentColor"/>
                </svg>
            </div>
        </div>
    );
};

export default NotFound;
