import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Pen, Monitor, Sparkles, Star, Scissors, Camera, Layers, Palette } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../services/api';

// SVG icon map for categories
const CATEGORY_ICONS = {
    'Illustration': Palette,
    'Digital Art':  Monitor,
    'Mehendi':      Sparkles,
    'Makeup Art':   Star,
    'Crochet':      Layers,
    'Crafts':       Scissors,
    'Photography':  Camera,
    'default':      Pen,
};

// ── Static fallback data shown when the DB is empty ──────────────────────────
const DEFAULT_CATEGORIES = [
    { _id: 'dc-1', name: 'Illustration', bg: 'bg-cat-cream' },
    { _id: 'dc-2', name: 'Digital Art',  bg: 'bg-cat-tan' },
    { _id: 'dc-3', name: 'Mehendi',      bg: 'bg-warm-stone' },
    { _id: 'dc-4', name: 'Makeup Art',   bg: 'bg-muted-taupe', text: 'text-white' },
    { _id: 'dc-5', name: 'Crochet',      bg: 'bg-bg-cream' },
    { _id: 'dc-6', name: 'Crafts',       bg: 'bg-cat-cream' },
    { _id: 'dc-7', name: 'Photography',  bg: 'bg-cat-dark', text: 'text-white' },
];

const DEFAULT_ARTISTS = [
    {
        _id: 'da-1',
        name: 'Priya Sharma',
        specialty: 'Illustration & Digital Art',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=80',
    },
    {
        _id: 'da-2',
        name: 'Ananya Verma',
        specialty: 'Mehendi & Bridal Art',
        rating: 5.0,
        image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&h=400&fit=crop&q=80',
    },
    {
        _id: 'da-3',
        name: 'Riya Patel',
        specialty: 'Crochet & Handcraft',
        rating: 4.8,
        image: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&q=80',
    },
    {
        _id: 'da-4',
        name: 'Sneha Joshi',
        specialty: 'Photography & Portraits',
        rating: 4.9,
        image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&h=400&fit=crop&q=80',
    },
];
// ─────────────────────────────────────────────────────────────────────────────

const Home = () => {
    const { user } = useSelector(state => state.auth);
    const [dbCategories, setDbCategories] = useState([]);
    const [dbArtists, setDbArtists]       = useState([]);
    const [loadingArtists, setLoadingArtists] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, artistRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/artists?limit=4'),
                ]);
                setDbCategories(catRes.data.data);
                setDbArtists(artistRes.data.data);
            } catch (err) {
                console.error('Failed to load homepage data', err);
            } finally {
                setLoadingArtists(false);
            }
        };
        fetchData();
    }, []);

    // Resolved data: use DB when available, fall back to defaults
    const categories = dbCategories.length > 0 ? dbCategories : DEFAULT_CATEGORIES;
    const artists    = dbArtists.length    > 0 ? dbArtists    : null; // null = show defaults

    // Background map for DB-sourced categories (icons come from CATEGORY_ICONS)
    const categoryBg = {
        'Illustration': { bg: 'bg-cat-cream' },
        'Digital Art':  { bg: 'bg-cat-tan' },
        'Mehendi':      { bg: 'bg-warm-stone' },
        'Makeup Art':   { bg: 'bg-muted-taupe', text: 'text-white' },
        'Crochet':      { bg: 'bg-bg-cream' },
        'Crafts':       { bg: 'bg-cat-cream' },
        'Photography':  { bg: 'bg-cat-dark', text: 'text-white' },
        'default':      { bg: 'bg-stone-200' },
    };


    return (
        <div className="bg-bg-cream min-h-screen pb-20">
            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        
                        {/* Hero Text */}
                        <div className="max-w-xl">
                            <h1 className="text-6xl md:text-7xl font-playfair font-bold text-text-brown leading-[1.1] mb-6">
                                Discover Art<br/>
                                That Inspires
                            </h1>
                            <p className="text-xl text-stone-600 mb-10 max-w-md leading-relaxed">
                                Connect with talented artists and bring your ideas to life.
                            </p>
                            
                            <div className="flex flex-wrap items-center gap-4 mb-12">
                                <Link to="/artists">
                                    <button className="bg-btn-brown text-white px-8 py-3.5 rounded-full font-medium flex items-center gap-2 hover:bg-opacity-90 transition">
                                        Explore Artists <ChevronRight className="w-5 h-5" />
                                    </button>
                                </Link>
                                <Link to="/register?role=artist">
                                    <button className="bg-transparent text-text-brown border-2 border-text-brown/20 px-8 py-3.5 rounded-full font-medium hover:border-text-brown transition">
                                        Become an Artist
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Hero Collage */}
                        <div className="relative h-[550px] hidden lg:block">
                            {/* Decorative Background Blob */}
                            <div className="absolute top-10 right-10 w-96 h-96 bg-cat-mocha/30 rounded-full blur-3xl"></div>
                            
                            {/* Central Portrait */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-72 z-20 shadow-2xl rounded-3xl overflow-hidden border-8 border-bg-cream">
                                <img src="https://images.unsplash.com/photo-1593382067395-ace3045a1547?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YXJ0aXN0fGVufDB8fDB8fHww" className="w-full h-full object-cover" alt="Portrait Art" />
                            </div>

                            {/* Top Left Canvas */}
                            <div className="absolute top-10 left-10 w-48 h-56 z-10 shadow-lg rounded-3xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=500&fit=crop" className="w-full h-full object-cover" alt="Canvas" />
                            </div>

                            {/* Top Right Hands/Mehendi */}
                            <div className="absolute top-4 right-4 w-56 h-48 z-10 shadow-lg rounded-3xl overflow-hidden">
                                <img src="https://plus.unsplash.com/premium_photo-1661896237419-6e232b54eefc?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8bWVoZW5kaXxlbnwwfHwwfHx8MA%3D%3D" className="w-full h-full object-cover" alt="Mehendi" />
                            </div>

                            {/* Bottom Left Hands Painting */}
                            <div className="absolute bottom-10 left-4 w-56 h-40 z-30 shadow-xl rounded-3xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1579965342575-16428a7c8881?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8cGFpbnRpbmd8ZW58MHx8MHx8fDA%3D" className="w-full h-full object-cover" alt="Painting" />
                            </div>

                            {/* Bottom Right Craft */}
                            <div className="absolute bottom-20 right-10 w-48 h-48 z-10 shadow-lg rounded-3xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1680796681732-ed0d5a7c3d74?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8b3JnYW1pfGVufDB8fDB8fHww" className="w-full h-full object-cover" alt="Craft" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Areas */}
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 pb-12">
                <div className="space-y-16">                    {/* Popular Categories */}
                    <section>
                        <div className="flex justify-between items-end mb-6">
                            <h2 className="text-2xl font-semibold text-text-brown">Popular Categories</h2>
                            <Link to="/artists" className="text-sm font-semibold text-text-brown flex items-center hover:underline">
                                View All <ChevronRight className="w-4 h-4 ml-1" />
                            </Link>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                            {categories.map((cat) => {
                                const style = cat.bg
                                    ? { bg: cat.bg, text: cat.text }
                                    : (categoryBg[cat.name] || categoryBg['default']);
                                const IconComponent = CATEGORY_ICONS[cat.name] || CATEGORY_ICONS['default'];
                                return (
                                    <Link
                                        key={cat._id}
                                        to={`/artists?category=${encodeURIComponent(cat.name)}`}
                                        className={`min-w-[130px] p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-sm hover:scale-105 transition-transform ${style.bg} ${style.text || 'text-text-brown'}`}
                                    >
                                        <IconComponent className="w-7 h-7" strokeWidth={1.5} />
                                        <span className="text-sm font-semibold whitespace-nowrap">{cat.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </section>

                    {/* Featured Artists */}
                    <section>
                        <h2 className="text-2xl font-semibold text-text-brown mb-6">Featured Artists</h2>

                        {/* Loading skeletons */}
                        {loadingArtists ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {[1,2,3,4].map(n => <div key={n} className="h-64 bg-stone-100 animate-pulse rounded-3xl" />)}
                            </div>

                        /* Real DB artists */
                        ) : artists ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {artists.map((artist) => (
                                    <Link key={artist._id} to={`/artists/${artist._id}`} className="bg-white rounded-3xl p-4 shadow-sm group cursor-pointer hover:shadow-md transition">
                                        <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
                                            <img
                                                src={artist.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${artist.artistId?.email}`}
                                                alt={artist.artistId?.email}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            <button className="absolute top-3 right-3 text-white bg-black/20 p-2 rounded-full hover:bg-black/40 backdrop-blur-sm transition">
                                                <Heart className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="px-2 pb-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-text-brown text-lg truncate flex-1 mr-2">
                                                    {artist.artistId?.email?.split('@')[0]}
                                                </h3>
                                                <div className="flex items-center text-sm font-bold text-text-brown shrink-0">
                                                    <span className="text-orange-400 mr-1">★</span>
                                                    {artist.avgRating ? artist.avgRating.toFixed(1) : '5.0'}
                                                </div>
                                            </div>
                                            <p className="text-stone-500 text-sm truncate">{artist.categories?.join(', ') || 'Artist'}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>

                        /* Default placeholder artists */
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {DEFAULT_ARTISTS.map((artist) => (
                                    <Link key={artist._id} to="/artists" className="bg-white rounded-3xl p-4 shadow-sm group cursor-pointer hover:shadow-md transition">
                                        <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
                                            <img
                                                src={artist.image}
                                                alt={artist.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                            />
                                            <button className="absolute top-3 right-3 text-white bg-black/20 p-2 rounded-full hover:bg-black/40 backdrop-blur-sm transition">
                                                <Heart className="w-4 h-4" />
                                            </button>
                                            <span className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm text-xs font-semibold text-text-brown px-2 py-1 rounded-full">
                                                ✦ Featured
                                            </span>
                                        </div>
                                        <div className="px-2 pb-2">
                                            <div className="flex justify-between items-start mb-1">
                                                <h3 className="font-bold text-text-brown text-lg truncate flex-1 mr-2">
                                                    {artist.name}
                                                </h3>
                                                <div className="flex items-center text-sm font-bold text-text-brown shrink-0">
                                                    <span className="text-orange-400 mr-1">★</span>
                                                    {artist.rating.toFixed(1)}
                                                </div>
                                            </div>
                                            <p className="text-stone-500 text-sm truncate">{artist.specialty}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* CTA Box - Integrated into main flow */}
                    <section className="bg-cat-mocha/20 p-12 rounded-[3rem] relative overflow-hidden border border-cat-mocha/10">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="max-w-md text-center md:text-left">
                                <h3 className="text-3xl font-playfair font-bold text-text-brown mb-4 leading-tight">
                                    Ready to Get Your Own<br/>Custom Artwork?
                                </h3>
                                <p className="text-stone-600 mb-8">Connect with thousands of creators and bring your vision to life today.</p>
                                <Link to="/artists">
                                    <button className="bg-btn-brown text-white px-10 py-4 rounded-full font-medium flex items-center gap-2 hover:bg-opacity-90 transition inline-flex">
                                        Start Your Commission <ChevronRight className="w-5 h-5" />
                                    </button>
                                </Link>
                            </div>
                            
                            {/* Decorative Brush Image */}
                            <div className="w-64 h-64 bg-white/40 backdrop-blur-sm rounded-full p-8 shadow-xl border border-white/50">
                                <img 
                                    src="https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=400&fit=crop" 
                                    className="w-full h-full object-cover rounded-full"
                                    alt="Decoration"
                                />
                            </div>
                        </div>
                        
                        {/* More blobs */}
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-cat-mocha/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-warm-stone/20 rounded-full blur-3xl"></div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Home;
