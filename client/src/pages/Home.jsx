import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, FileText, CheckCircle, Clock } from 'lucide-react';
import { useSelector } from 'react-redux';
import api from '../services/api';

const Home = () => {
    const { user } = useSelector(state => state.auth);
    const [dbCategories, setDbCategories] = useState([]);
    const [dbArtists, setDbArtists] = useState([]);
    const [loadingArtists, setLoadingArtists] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catRes, artistRes] = await Promise.all([
                    api.get('/categories'),
                    api.get('/artists?limit=4') // Fetch top 4 for homepage
                ]);
                setDbCategories(catRes.data.data);
                setDbArtists(artistRes.data.data);
            } catch (err) {
                console.error("Failed to load homepage data", err);
            } finally {
                setLoadingArtists(false);
            }
        };
        fetchData();
    }, []);

    // Visual map for UI
    const categoryStyles = {
        'Illustration': { icon: '🎨', bg: 'bg-cat-cream' },
        'Digital Art': { icon: '💻', bg: 'bg-cat-tan' },
        'Mehendi': { icon: '🌿', bg: 'bg-warm-stone' },
        'Makeup Art': { icon: '💄', bg: 'bg-muted-taupe', text: 'text-white' },
        'Crochet': { icon: '🧶', bg: 'bg-bg-cream' },
        'Crafts': { icon: '✂️', bg: 'bg-cat-cream' },
        'Photography': { icon: '📷', bg: 'bg-cat-dark', text: 'text-white' },
        // Fallback
        'default': { icon: '✨', bg: 'bg-stone-200' }
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

                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-stone-500">Trusted by:</div>
                                <div className="flex -space-x-2">
                                    <img className="w-8 h-8 rounded-full border-2 border-bg-cream" src="https://i.pravatar.cc/100?img=1" alt="Avatar"/>
                                    <img className="w-8 h-8 rounded-full border-2 border-bg-cream" src="https://i.pravatar.cc/100?img=2" alt="Avatar"/>
                                    <img className="w-8 h-8 rounded-full border-2 border-bg-cream" src="https://i.pravatar.cc/100?img=3" alt="Avatar"/>
                                    <img className="w-8 h-8 rounded-full border-2 border-bg-cream" src="https://i.pravatar.cc/100?img=4" alt="Avatar"/>
                                </div>
                                <div className="text-sm font-bold text-text-brown">5,000+ Creators</div>
                            </div>
                        </div>

                        {/* Hero Collage */}
                        <div className="relative h-[550px] hidden lg:block">
                            {/* Decorative Background Blob */}
                            <div className="absolute top-10 right-10 w-96 h-96 bg-cat-mocha/30 rounded-full blur-3xl"></div>
                            
                            {/* Central Portrait */}
                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-72 z-20 shadow-2xl rounded-3xl overflow-hidden border-8 border-bg-cream">
                                <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=500&fit=crop" className="w-full h-full object-cover" alt="Portrait Art" />
                            </div>

                            {/* Top Left Canvas */}
                            <div className="absolute top-10 left-10 w-48 h-56 z-10 shadow-lg rounded-3xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&h=500&fit=crop" className="w-full h-full object-cover" alt="Canvas" />
                            </div>

                            {/* Top Right Hands/Mehendi */}
                            <div className="absolute top-4 right-4 w-56 h-48 z-10 shadow-lg rounded-3xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1589330694653-efa6477d85ea?w=400&h=300&fit=crop" className="w-full h-full object-cover" alt="Mehendi" />
                            </div>

                            {/* Bottom Left Hands Painting */}
                            <div className="absolute bottom-10 left-4 w-56 h-40 z-30 shadow-xl rounded-3xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1459908676235-46f55eeb557e?w=400&h=300&fit=crop" className="w-full h-full object-cover" alt="Hands" />
                            </div>

                            {/* Bottom Right Craft */}
                            <div className="absolute bottom-20 right-10 w-48 h-48 z-10 shadow-lg rounded-3xl overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1584448554228-5527a42bead2?w=400&h=400&fit=crop" className="w-full h-full object-cover" alt="Craft" />
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
                        {dbCategories.length > 0 ? (
                            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                                {dbCategories.map((cat, idx) => {
                                    const style = categoryStyles[cat.name] || categoryStyles['default'];
                                    return (
                                        <div key={cat._id} className={`min-w-[120px] p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 cursor-pointer shadow-sm hover:scale-105 transition-transform ${style.bg} ${style.text || 'text-text-brown'}`}>
                                            <div className="text-3xl">{style.icon}</div>
                                            <span className="text-sm font-semibold whitespace-nowrap">{cat.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="bg-white/50 border border-dashed border-stone-300 rounded-[2rem] p-8 text-center text-stone-500 italic">
                                No categories found. Highlighting local craftsmanship soon!
                            </div>
                        )}
                    </section>

                    {/* Featured Artists */}
                    <section>
                        <h2 className="text-2xl font-semibold text-text-brown mb-6">Featured Artists</h2>
                        {loadingArtists ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {[1,2,3,4].map(n => <div key={n} className="h-64 bg-stone-100 animate-pulse rounded-3xl" />)}
                            </div>
                        ) : dbArtists.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                {dbArtists.map((artist) => (
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
                        ) : (
                            <div className="bg-white/50 border border-dashed border-stone-300 rounded-3xl p-12 text-center text-stone-500 italic">
                                Our community of artists is growing. Check back soon for new talent!
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
