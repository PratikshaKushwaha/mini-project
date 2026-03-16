import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Button from '../components/Button';

const BrowseArtists = () => {
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchArtists = async () => {
            try {
                const res = await api.get('/artists');
                setArtists(res.data.data.profiles);
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
                    {artists.map((profile) => (
                        <div key={profile._id} className="card group hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                            <div className="h-48 bg-stone-200 overflow-hidden relative">
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt="Artist" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-400 bg-warm-stone/20">
                                        No Image
                                    </div>
                                )}
                            </div>
                            <div className="p-6 flex-grow flex flex-col">
                                <h3 className="text-xl font-bold font-inter mb-1">{profile.artistId?.email?.split('@')[0] || 'Artist'}</h3>
                                <p className="text-sm text-muted-taupe mb-4">{profile.location || 'Remote'}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {profile.categories?.slice(0, 3).map((cat, idx) => (
                                        <span key={idx} className="text-xs bg-stone-100 text-deep-cocoa px-2 py-1 rounded-full">{cat}</span>
                                    ))}
                                </div>
                                <div className="mt-auto">
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
