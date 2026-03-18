import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';

const BrowseArtists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const res = await api.get('/artists');
                setArtists(res.data.data.data || []);
            } catch (error) {
                console.error("Failed to fetch artists", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtists();
    }, []);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-playfair text-center mb-12">Discover Artists</h1>
            
            {loading ? (
                <div className="text-center text-muted-taupe">Loading artists...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                    {artists?.map((profile) => (
                        <div key={profile._id} className="card group hover:shadow-md transition-shadow cursor-pointer flex flex-col pt-0 px-0 overflow-hidden">
                            {/* Banner Image */}
                            <div className="h-32 bg-stone-200 overflow-hidden relative">
                                {profile.artistId?.bannerImage ? (
                                    <img src={profile.artistId.bannerImage} alt="Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full pattern-dots pattern-stone-300 pattern-bg-stone-100 pattern-size-4 pattern-opacity-40"></div>
                                )}
                            </div>
                            
                            <div className="px-6 pb-6 flex-grow flex flex-col relative">
                                {/* Overlapping Avatar */}
                                <div className="w-20 h-20 rounded-full border-4 border-white shadow-sm overflow-hidden bg-cat-tan shrink-0 absolute -top-10 left-6">
                                    <img 
                                        src={profile.artistId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.artistId?.email}`} 
                                        alt="Profile" 
                                        className="w-full h-full object-cover" 
                                    />
                                </div>
                                
                                <div className="mt-12">
                                    <h3 className="text-xl font-bold font-inter mb-0 tracking-tight text-deep-cocoa flex flex-wrap items-center gap-2">
                                        {profile.artistId?.fullName || profile.artistId?.email?.split('@')[0]}
                                    </h3>
                                    {profile.artistId?.username && (
                                        <p className="text-sm text-stone-400 font-medium mb-1">@{profile.artistId.username}</p>
                                    )}
                                    <p className="text-sm text-muted-taupe mb-4">{profile.location || 'Remote'}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {profile.categories?.slice(0, 3).map((cat, idx) => (
                                            <span key={idx} className="text-xs bg-stone-100 text-deep-cocoa px-2 py-1 rounded-full font-medium">{cat}</span>
                                        ))}
                                    </div>

                                    {/* Portfolio Preview */}
                                    {profile.portfolioPreview && profile.portfolioPreview.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            {profile.portfolioPreview.map((item, idx) => (
                                                <div key={idx} className="aspect-square bg-stone-100 rounded-lg overflow-hidden border border-stone-200/50">
                                                    <img 
                                                        src={item.mediaUrl} 
                                                        alt={item.title} 
                                                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-auto pt-4">
                                    <Link to={`/artists/${profile.artistId._id}`} className="block w-full">
                                        <Button variant="outline" className="w-full text-sm">View Profile</Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                    {artists.length === 0 && (
                        <div className="col-span-full text-center text-muted-taupe py-12">
                            No artists found. Check back later!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default BrowseArtists;
