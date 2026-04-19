import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Globe, Instagram, Twitter, MapPin } from 'lucide-react';
import Button from '../../components/Button';
import { Helmet } from 'react-helmet-async';
import RequestCommissionModal from '../../components/RequestCommissionModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ArtistProfile = () => {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [portfolio, setPortfolio] = useState([]);
    const [reviewState, setReviewState] = useState({ reviews: [], stats: { avgRating: 0, totalReviews: 0 } });
    const [loading, setLoading] = useState(true);
    const [purchaseLoading, setPurchaseLoading] = useState(false);
    const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    const handleBuyItem = async (item) => {
        if (!user) {
            toast.error("Please login to purchase artwork.");
            return;
        }

        setPurchaseLoading(true);
        try {
            const deadlineDate = new Date();
            deadlineDate.setDate(deadlineDate.getDate() + 7);
            
            const res = await api.post('/orders', {
                artistId: id,
                title: `Purchase Artwork: ${item.title}`,
                description: `I would like to purchase the available artwork: ${item.title}\n\nDescription: ${item.description}`,
                deadline: deadlineDate.toISOString().split('T')[0],
                orderType: 'direct',
                price: item.price,
                portfolioItemId: item._id
            });
            
            toast.success("Purchase request created successfully!");
            navigate(`/orders/${res.data.data._id}`);
        } catch(err) {
            toast.error(err.response?.data?.message || "Failed to submit purchase request.");
        } finally {
            setPurchaseLoading(false);
        }
    };

    useEffect(() => {
        const fetchArtistData = async () => {
            try {
                // Fetch profile
                const profileRes = await api.get(`/artists/${id}`);
                const { artist, profile: artistProfile } = profileRes.data.data;
                setProfile({ ...(artistProfile || {}), artistId: artist });

                // Fetch portfolio/artworks
                const portfolioRes = await api.get(`/portfolio/${id}`);
                setPortfolio(portfolioRes.data.data);

                // Fetch reviews
                const reviewsRes = await api.get(`/reviews/artist/${id}`);
                setReviewState(reviewsRes.data.data);

            } catch (error) {
                console.error("Failed to fetch artist profile:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchArtistData();
    }, [id]);

    if (loading) {
        return <div className="min-h-screen pt-24 text-center text-muted-taupe">Loading Artist Profile...</div>;
    }

    if (!profile) {
        return <div className="min-h-screen pt-24 text-center text-red-500">Artist not found.</div>;
    }

    return (
        <div className="bg-bg-cream min-h-screen pb-20">
            <Helmet>
                <title>{`${profile.artistId?.email?.split('@')[0] || 'Artist'} | ArtisanConnect`}</title>
                <meta name="description" content={profile.bio || `Check out the portfolio of ${profile.artistId?.email?.split('@')[0]} on ArtisanConnect.`} />
                <meta property="og:title" content={`${profile.artistId?.email?.split('@')[0]} - Artist Portfolio`} />
                <meta property="og:description" content={profile.bio || "Hire this artist for your next creative project."} />
                <meta property="og:image" content={profile.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.artistId?.email}`} />
                <meta property="og:type" content="profile" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            {/* Header / Cover Area - LinkedIn Style */}
            <div className="w-full relative">
                <div className="h-64 md:h-80 w-full overflow-hidden bg-stone-200">
                    {profile.artistId?.bannerImage ? (
                        <img 
                            src={profile.artistId.bannerImage} 
                            alt="Cover" 
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full pattern-dots pattern-stone-300 pattern-bg-stone-100 pattern-size-4 pattern-opacity-40"></div>
                    )}
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 -mt-20">
                <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* Avatar - Overlapping the Banner */}
                        <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-cat-tan shrink-0 -mt-16 md:-mt-24 relative z-20">
                            <img 
                                src={profile.artistId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.artistId?.email}`} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                            />
                        </div>

                        {/* Info Header */}
                        <div className="flex-1 mt-4 md:mt-0 pt-2">
                            <h1 className="text-4xl font-playfair font-bold text-text-brown flex flex-col md:flex-row md:items-baseline gap-2 mb-1">
                                {profile.artistId?.fullName || profile.artistId?.email?.split('@')[0]}
                                {profile.artistId?.username && (
                                    <span className="text-xl font-inter text-stone-400 font-normal">@{profile.artistId.username}</span>
                                )}
                            </h1>
                            
                            <div className="flex flex-wrap items-center text-stone-500 mb-4 gap-4 text-sm font-medium">
                                {profile.location && (
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-4 h-4" /> <span>{profile.location}</span>
                                    </div>
                                )}
                                {profile.artistId?.dob && (
                                   <div className="flex items-center gap-1 text-stone-400">
                                       <span>Born: {new Date(profile.artistId.dob).toLocaleDateString()}</span>
                                   </div>
                                )}
                                <div className="flex items-center gap-1 text-orange-400 font-bold ml-auto md:ml-0 md:border-l md:border-stone-200 md:pl-4">
                                    ★ {reviewState?.stats?.avgRating?.toFixed(1) || '0.0'} <span className="text-stone-400 font-normal">({reviewState?.stats?.totalReviews || 0} reviews)</span>
                                </div>
                            </div>

                            <p className="text-lg text-stone-700 leading-relaxed mb-6 max-w-2xl whitespace-pre-wrap">
                                {profile.bio || "No bio provided yet."}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {profile.categories?.map((cat, idx) => (
                                    <span key={idx} className="bg-cat-cream border border-stone-200 text-text-brown px-3 py-1 rounded-full text-sm font-medium">
                                        {cat}
                                    </span>
                                ))}
                            </div>

                            {/* Links */}
                            <div className="flex gap-4">
                                {profile.website && (
                                    <a href={profile.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-btn-brown transition">
                                        <Globe className="w-5 h-5" /> <span>Website</span>
                                    </a>
                                )}
                                {profile.instagram && (
                                    <a href={`https://instagram.com/${profile.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-btn-brown transition">
                                        <Instagram className="w-5 h-5" /> <span>Instagram</span>
                                    </a>
                                )}
                                {profile.twitter && (
                                    <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-stone-600 hover:text-btn-brown transition">
                                        <Twitter className="w-5 h-5" /> <span>Twitter</span>
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* CTA / Action */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <Button 
                                className="w-full" 
                                onClick={() => {
                                    if (!user) {
                                        toast.error("Please login to request a commission");
                                        return;
                                    }
                                    setIsRequestModalOpen(true);
                                }}
                            >
                                Request Commission
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Artwork Showcase */}
                <div>
                    <h2 className="text-3xl font-playfair font-bold text-text-brown mb-8 flex items-center justify-between">
                        Artwork Showcase
                        <span className="text-sm font-medium text-stone-500 font-inter">{portfolio?.length || 0} posts</span>
                    </h2>

                    {(!portfolio || portfolio.length === 0) ? (
                        <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200">
                            <p className="text-muted-taupe text-lg">No artwork posted yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {(portfolio || []).map(item => (
                                <div key={item._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow border border-stone-100 group">
                                    <div className="h-64 relative overflow-hidden bg-stone-100">
                                        <img 
                                            src={item.imageUrl} 
                                            alt={item.title} 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        {item.price > 0 && (
                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-text-brown font-bold px-3 py-1.5 rounded-lg shadow-sm">
                                                ${item.price.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-5 flex flex-col justify-between" style={{ minHeight: '140px' }}>
                                        <div>
                                            <h3 className="text-xl font-bold text-deep-cocoa mb-2">{item.title}</h3>
                                            <p className="text-stone-600 text-sm line-clamp-2">{item.description}</p>
                                        </div>
                                        {item.price > 0 && item.isAvailableForSale !== false && (
                                            <Button 
                                                onClick={() => handleBuyItem(item)}
                                                disabled={purchaseLoading}
                                                className="w-full mt-4"
                                            >
                                                Purchase Artwork
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reviews Section */}
                <div className="mt-20">
                    <h2 className="text-3xl font-playfair font-bold text-text-brown mb-8 flex items-center justify-between">
                        Reviews & Feedback
                        <span className="text-sm font-medium text-stone-500 font-inter">{reviewState?.reviews?.length || 0} reviews</span>
                    </h2>

                    {!reviewState?.reviews?.length ? (
                        <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200">
                            <p className="text-muted-taupe text-lg">No reviews yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {(reviewState?.reviews || []).map(review => (
                                <div key={review._id} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                                        <img src={review.clientId?.profileImage || `https://api.dicebear.com/7.x/notionists/svg?seed=${review.clientId?.email}`} alt="User" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-deep-cocoa">{review.clientId?.fullName || review.clientId?.email?.split('@')[0]}</span>
                                            <span className="text-yellow-400 font-bold text-sm">★ {review.rating}</span>
                                            <span className="text-xs text-stone-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-stone-600 text-sm leading-relaxed">{review.comment || (
                                            <span className="italic opacity-50 text-xs">Rated this commission {review.rating} stars.</span>
                                        )}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <RequestCommissionModal 
                isOpen={isRequestModalOpen} 
                onClose={() => setIsRequestModalOpen(false)} 
                artistId={id} 
                artistName={profile.artistId?.email?.split('@')[0]} 
            />
        </div>
    );
};

export default ArtistProfile;
