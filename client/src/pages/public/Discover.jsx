import React, { useEffect, useState, useCallback } from 'react';
import { getArtists, getCategories } from '../../services/api';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import { Search, Filter, MapPin, Star, Palette, CheckCircle2, X } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * @component Discover
 * @description The primary discovery page for Clients to find and filter artists.
 * Features debounced searching, category/location filtering, and paginated results.
 * @returns {JSX.Element} The rendered Discover page.
 */
const Discover = () => {
    const [artists, setArtists] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedLocation, setSelectedLocation] = useState('');
    const [availability, setAvailability] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [debouncedSearch, setDebouncedSearch] = useState('');
    
    /** @description Handle debounced search to minimize API calls during typing. */
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    /** @description Fetches artists based on current filter state. */
    const fetchArtists = useCallback(async () => {
        setLoading(true);
        try {
            const params = {
                page,
                search: debouncedSearch,
                category: selectedCategory,
                location: selectedLocation,
                availability: availability === null ? undefined : availability
            };
            const res = await getArtists(params);
            setArtists(res.data.data.profiles || []);
            setTotalPages(res.data.data.totalPages || 1);
        } catch (error) {
            console.error("Failed to fetch artists", error);
            toast.error("Could not load artists");
        } finally {
            setLoading(false);
        }
    }, [page, debouncedSearch, selectedCategory, selectedLocation, availability]);

    /** @description Fetch categories on mount for filter options. */
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const catRes = await getCategories();
                setCategories(catRes.data.data || []);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        fetchArtists();
    }, [fetchArtists]);

    /** @description Resets all filter states to default values. */
    const clearFilters = () => {
        setSearch('');
        setSelectedCategory('');
        setSelectedLocation('');
        setAvailability(null);
    };

    return (
        <div className="bg-[#f9f7f5] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-4xl font-playfair font-bold text-deep-cocoa tracking-tight">Discover Artists</h1>
                        <p className="text-muted-taupe mt-2">Connect with world-class creators for your next masterpiece.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-deep-cocoa flex items-center gap-2">
                                    <Filter size={18} /> Filters
                                </h2>
                                {(selectedCategory || selectedLocation || availability !== null || search) && (
                                    <button 
                                        onClick={clearFilters}
                                        className="text-xs font-semibold text-muted-taupe hover:text-deep-cocoa transition underline"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                {/* Search Input */}
                                <div className="relative">
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">Search</label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
                                        <input 
                                            type="text"
                                            placeholder="Keyword, style, name..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-btn-brown outline-none transition text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Categories */}
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 block">Category</label>
                                    <div className="flex flex-wrap gap-2">
                                        {categories.map((cat) => (
                                            <button
                                                key={cat._id}
                                                onClick={() => setSelectedCategory(selectedCategory === cat.name ? '' : cat.name)}
                                                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                                                    selectedCategory === cat.name 
                                                    ? 'bg-deep-cocoa border-deep-cocoa text-white' 
                                                    : 'bg-white border-stone-200 text-muted-taupe hover:border-muted-taupe'
                                                }`}
                                            >
                                                {cat.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">Location</label>
                                    <select 
                                        value={selectedLocation}
                                        onChange={(e) => setSelectedLocation(e.target.value)}
                                        className="w-full p-2 bg-stone-50 border border-stone-200 rounded-xl outline-none text-sm cursor-pointer"
                                    >
                                        <option value="">Anywhere</option>
                                        <option value="remote">Remote / Online</option>
                                        <option value="mumbai">Mumbai</option>
                                        <option value="delhi">Delhi</option>
                                        <option value="bangalore">Bangalore</option>
                                    </select>
                                </div>

                                {/* Availability Toggle */}
                                <div>
                                    <label className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">Availability</label>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => setAvailability(true)}
                                            className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${availability === true ? 'bg-green-50 border-green-200 text-green-700' : 'bg-white border-stone-200 text-stone-500'}`}
                                        >
                                            Available
                                        </button>
                                        <button 
                                            onClick={() => setAvailability(null)}
                                            className={`flex-1 py-2 text-xs font-semibold rounded-xl border transition ${availability === null ? 'bg-stone-100 border-transparent text-stone-700' : 'bg-white border-stone-200 text-stone-400'}`}
                                        >
                                            All
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Artists Grid */}
                    <div className="lg:col-span-3">
                        {loading && page === 1 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 3, 4].map(n => (
                                    <div key={n} className="bg-white rounded-3xl h-96 animate-pulse border border-stone-100"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {artists.map((profile) => (
                                        <div key={profile._id} className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
                                            {/* Banner & Avatar */}
                                            <div className="h-28 bg-stone-100 relative">
                                                {profile.artistId?.bannerImage ? (
                                                    <img src={profile.artistId.bannerImage} alt="Banner" className="w-full h-full object-cover" />
                                                ) : (
                                                    <img 
                                                        src={profile.artistId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.artistId?.email}`} 
                                                        alt="Fallback Banner" 
                                                        className="w-full h-full object-cover opacity-60 blur-sm" 
                                                    />
                                                )}
                                                <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-2xl border-4 border-white overflow-hidden shadow-md bg-white">
                                                    <img 
                                                        src={profile.artistId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.artistId?.email}`} 
                                                        alt="Avatar" 
                                                        className="w-full h-full object-cover" 
                                                    />
                                                </div>
                                                {profile.availability && (
                                                    <div className="absolute top-4 right-4 px-3 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full uppercase tracking-tighter flex items-center gap-1 shadow-sm">
                                                        <CheckCircle2 size={10} /> Accepting Requests
                                                    </div>
                                                )}
                                            </div>

                                            <div className="px-6 pt-12 pb-6 flex-grow flex flex-col">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-deep-cocoa">{profile.artistId?.fullName}</h3>
                                                        <p className="text-xs text-stone-400">@{profile.artistId?.username}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-sm font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                                                        <Star size={14} fill="currentColor" /> {profile.avgRating || 'New'}
                                                    </div>
                                                </div>

                                                <p className="text-sm text-muted-taupe line-clamp-2 mb-4 italic">"{profile.bio || 'Professional artist'}"</p>

                                                <div className="flex items-center gap-4 text-xs text-stone-500 mb-6">
                                                    <span className="flex items-center gap-1"><MapPin size={12} /> {profile.location || 'Remote'}</span>
                                                    <span className="flex items-center gap-1"><Palette size={12} /> {profile.categories?.slice(0, 2).join(', ')}</span>
                                                </div>

                                                {/* Portfolio Preview */}
                                                <div className="grid grid-cols-3 gap-2 mb-6">
                                                    {(profile.portfolioPreview || []).map((art, idx) => (
                                                        <div key={idx} className="aspect-square bg-stone-50 rounded-xl overflow-hidden border border-stone-100">
                                                            <img src={art.imageUrl} alt="Artwork" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                                        </div>
                                                    ))}
                                                    {(!profile.portfolioPreview || profile.portfolioPreview.length === 0) && (
                                                        [1, 2, 3].map(n => <div key={n} className="aspect-square bg-stone-50 rounded-xl border border-dashed border-stone-200"></div>)
                                                    )}
                                                </div>

                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-stone-100">
                                                    <div className="text-sm">
                                                        <span className="text-stone-400">Starts at </span>
                                                        <span className="font-bold text-deep-cocoa">₹{profile.startingPrice || 500}</span>
                                                    </div>
                                                    <Link to={`/artists/${profile.artistId?._id}`}>
                                                        <Button variant="outline" className="text-xs py-2 px-4 h-auto rounded-xl bg-white hover:bg-stone-50">View Profile</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {artists.length === 0 && (
                                    <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-stone-200">
                                        <h3 className="text-xl font-bold text-deep-cocoa">No artists found</h3>
                                        <p className="text-muted-taupe mt-1">Try adjusting your filters or search keywords.</p>
                                        <button onClick={clearFilters} className="mt-4 text-btn-brown font-semibold hover:underline">Clear all filters</button>
                                    </div>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-12 flex justify-center items-center gap-2">
                                        {[...Array(totalPages)].map((_, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setPage(i + 1)}
                                                className={`w-10 h-10 rounded-xl font-bold transition flex items-center justify-center ${
                                                    page === i + 1 
                                                    ? 'bg-deep-cocoa text-white' 
                                                    : 'bg-white text-muted-taupe hover:bg-stone-100 border border-stone-200'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Discover;
