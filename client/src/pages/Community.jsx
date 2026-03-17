import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    ChevronRight,
    Users,
    Sparkles,
    BookOpen,
    PlusCircle
} from "lucide-react";
import { getPosts, createPost, toggleLike, addComment } from "../services/api";
import CreatePostModal from "../components/CreatePostModal";
import toast from "react-hot-toast";

// ── Markdown-lite renderer (bold only) ───────────────────────────────────────
function renderBody(text) {
    if (!text) return null;
    return text.split("\n").map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
            part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j} className="font-semibold text-text-brown">
                    {part.slice(2, -2)}
                </strong>
            ) : (
                part
            ),
        );
        return (
            <p key={i} className={`${line === "" ? "mt-3" : "mb-1"} leading-relaxed`}>
                {parts}
            </p>
        );
    });
}

// ── Post Card ────────────────────────────────────────────────────────────────
function PostCard({ post, user, onLike, onComment }) {
    const isLiked = user ? post.likes.includes(user._id) : false;
    const authorName = post.author?.fullName || post.author?.email?.split('@')[0] || 'Unknown User';
    
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState("");
    const navigate = useNavigate();

    const handleLikeClick = () => {
        if (!user) return navigate('/login');
        onLike(post._id);
    };

    const handleCommentSubmit = (e) => {
        e.preventDefault();
        if (!user) return navigate('/login');
        if (!commentText.trim()) return;
        
        onComment(post._id, commentText);
        setCommentText("");
    };

    return (
        <article className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Cover Image */}
            {post.image && (
                <div className="h-52 overflow-hidden bg-stone-100">
                    <img
                        src={post.image}
                        alt="Post attachment"
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-6 sm:p-8">
                {/* Author row */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?seed=${post.author?.email || 'anon'}`}
                        alt={authorName}
                        className="w-10 h-10 rounded-full bg-cat-tan border border-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-text-brown text-sm">
                                {authorName}
                            </span>
                            {post.author?.role === 'admin' && (
                                <span className="bg-text-brown text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                    Official
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-stone-400">
                            {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-stone-100 text-stone-600">
                        {post.tag}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-playfair font-bold text-text-brown mb-4 leading-snug">
                    {post.title}
                </h2>

                {/* Body */}
                <div className="text-stone-600 text-sm sm:text-base whitespace-pre-wrap">
                    {renderBody(post.body)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-5 mt-6 pt-5 border-t border-stone-100">
                    <button
                        onClick={handleLikeClick}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${isLiked ? "text-rose-500" : "text-stone-400 hover:text-rose-400"}`}
                    >
                        <Heart className={`w-4 h-4 ${isLiked ? "fill-rose-500" : ""}`} />
                        {post.likes.length}
                    </button>
                    <button 
                        onClick={() => setShowComments(!showComments)}
                        className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-text-brown transition-colors"
                    >
                        <MessageCircle className={`w-4 h-4 ${showComments ? 'fill-stone-200' : ''}`} />
                        {post.comments?.length || 0}
                    </button>
                </div>
                
                {/* Comments Section */}
                {showComments && (
                    <div className="mt-6 pt-6 border-t border-stone-50 space-y-4">
                        {post.comments?.map((comment, idx) => (
                            <div key={idx} className="flex gap-3 text-sm">
                                <img
                                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${comment.user?.email || 'anon'}`}
                                    className="w-6 h-6 rounded-full bg-stone-100"
                                    alt="avatar"
                                />
                                <div className="bg-stone-50 rounded-2xl rounded-tl-none px-4 py-3 flex-1">
                                    <p className="font-semibold text-text-brown text-xs mb-1">
                                        {comment.user?.fullName || comment.user?.email?.split('@')[0]}
                                    </p>
                                    <p className="text-stone-600">{comment.text}</p>
                                </div>
                            </div>
                        ))}
                        
                        <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-4">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder={user ? "Write a comment..." : "Log in to comment"}
                                disabled={!user}
                                className="flex-1 bg-stone-100 border-none rounded-full px-4 text-sm focus:ring-2 focus:ring-btn-brown/30"
                            />
                            <button 
                                type="submit" 
                                disabled={!user || !commentText.trim()}
                                className="bg-text-brown text-white px-4 py-2 rounded-full text-sm font-medium disabled:opacity-50"
                            >
                                Send
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </article>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const Community = () => {
    const { user } = useSelector((state) => state.auth);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await getPosts();
            setPosts(res.data.data);
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            toast.error("Could not load community feed.");
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePostClick = () => {
        if (!user) {
            toast("Please log in to make a post.", { icon: "👋" });
            navigate('/login');
            return;
        }
        setIsCreateModalOpen(true);
    };

    const handleCreatePostSubmit = async (formData) => {
        try {
            const res = await createPost(formData);
            setPosts([res.data.data, ...posts]);
            toast.success("Post successfully published!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to create post");
            throw error; // Rethrow to prevent modal close
        }
    };

    const handleToggleLike = async (postId) => {
        try {
            const res = await toggleLike(postId);
            setPosts(posts.map(p => {
                if (p._id === postId) {
                    const isNowLiked = res.data.data.isLiked;
                    let newLikes = [...p.likes];
                    
                    if (isNowLiked) newLikes.push(user._id);
                    else newLikes = newLikes.filter(id => id !== user._id);
                    
                    return { ...p, likes: newLikes };
                }
                return p;
            }));
        } catch (error) {
            toast.error("Failed to like post");
        }
    };

    const handleAddComment = async (postId, text) => {
        try {
            const res = await addComment(postId, { text });
            setPosts(posts.map(p => p._id === postId ? res.data.data : p));
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };
    return (
        <div className="bg-bg-cream min-h-screen pb-20">
            {/* Hero Banner */}
            <section className="bg-gradient-to-br from-cat-mocha/30 via-bg-cream to-cat-tan/20 pt-14 pb-16 border-b border-stone-200/60">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-stone-200/60 text-text-brown text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                        <Users className="w-3.5 h-3.5" /> ArtisanConnect Community
                    </div>
                    <h1 className="text-5xl sm:text-6xl font-playfair font-bold text-text-brown leading-tight mb-4">
                        A Space for
                        <br />
                        Creators & Clients
                    </h1>
                    <p className="text-stone-600 text-lg max-w-xl mx-auto mb-8">
                        Updates, guides, and conversations from the ArtisanConnect team and
                        community.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center gap-2 bg-text-brown text-white px-7 py-3 rounded-full font-medium hover:bg-opacity-90 transition"
                    >
                        Join the Community <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Stats Row */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 -mt-6">
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { icon: Users, label: "Members", value: "1,200+" },
                        { icon: Sparkles, label: "Artists", value: "340+" },
                        { icon: BookOpen, label: "Posts", value: "80+" },
                    ].map(({ icon: Icon, label, value }) => (
                        <div
                            key={label}
                            className="bg-white rounded-2xl p-5 shadow-sm text-center"
                        >
                            <Icon className="w-5 h-5 text-muted-taupe mx-auto mb-2" />
                            <p className="text-xl font-bold text-text-brown">{value}</p>
                            <p className="text-xs text-stone-500">{label}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Posts Feed */}
            <section className="max-w-3xl mx-auto px-4 sm:px-6 xl:px-8 mt-12 space-y-8">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-semibold text-text-brown">Latest Feed</h2>
                    <button 
                        onClick={handleCreatePostClick}
                        className="flex items-center gap-2 bg-text-brown text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-opacity-90 shadow-sm transition"
                    >
                        <PlusCircle className="w-5 h-5" /> Start Discussion
                    </button>
                </div>

                {loading ? (
                    <div className="text-center py-12 text-muted-taupe animate-pulse">Loading feed...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-3xl border border-stone-200 shadow-sm">
                        <p className="text-muted-taupe">No posts yet. Be the first to start a conversation!</p>
                    </div>
                ) : (
                    posts.map((post) => (
                        <PostCard 
                            key={post._id} 
                            post={post} 
                            user={user} 
                            onLike={handleToggleLike} 
                            onComment={handleAddComment} 
                        />
                    ))
                )}
            </section>
            
            <CreatePostModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                onSubmit={handleCreatePostSubmit} 
            />
        </div>
    );
};

export default Community;
