import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
    Heart,
    MessageCircle,
    Share2,
    Bookmark,
    ChevronRight,
    Users,
    Sparkles,
    BookOpen,
} from "lucide-react";

// ── Static community posts ────────────────────────────────────────────────────
const POSTS = [
    {
        id: "post-1",
        author: {
            name: "ArtisanConnect Team",
            avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=artisanteam",
            badge: "Official",
        },
        date: "March 2025",
        tag: "Announcement",
        tagColor: "bg-cat-tan text-text-brown",
        title: "🎉 Welcome to ArtisanConnect Community!",
        body: `We're thrilled to have you here! ArtisanConnect is a space where creativity meets opportunity — a platform built to celebrate talented local artists and connect them with clients who appreciate handcrafted work.

Whether you're an artist ready to showcase your skills, or a client searching for that perfect custom piece, you've found the right place.

**This community space is for you** — to ask questions, share inspiration, celebrate wins, and support one another. We're just getting started, and we couldn't be more excited to build this with all of you.

Welcome aboard. Let's create something beautiful together. ✨`,
        likes: 128,
        comments: 34,
        image:
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&h=400&fit=crop&q=80",
    },
    {
        id: "post-2",
        author: {
            name: "ArtisanConnect Team",
            avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=artisanteam",
            badge: "Official",
        },
        date: "March 2025",
        tag: "Guide",
        tagColor: "bg-warm-stone text-text-brown",
        title: "How ArtisanConnect Works — A Quick Guide",
        body: `Getting started is simple. Here's how the platform works for both artists and clients:

            For Artists:
            1. Create your profile — Sign up as an artist and fill in your bio, specialties, and portfolio images.
            2. List your services — Add services with clear descriptions and pricing.
            3. Receive commissions — Clients will find you and place orders directly through your profile.
            4. Deliver & get reviewed — Complete orders and build your reputation through honest reviews.

            For Clients:
            1. Browse artists — Explore by category, rating, or search for a specific skill.
            2. View profile — Check portfolios, read reviews, and compare services.
            3. Place an order — Send a commission request with your requirements.
            4. Stay updated — Track your order status and communicate through the platform.

            Have questions? Drop them below — our team and community are here to help!`,
        likes: 94,
        comments: 21,
        image:
            "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop&q=80",
    },
];

// ── Markdown-lite renderer (bold only) ───────────────────────────────────────
function renderBody(text) {
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
function PostCard({ post }) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);

    return (
        <article className="bg-white rounded-3xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            {/* Cover Image */}
            <div className="h-52 overflow-hidden">
                <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover"
                />
            </div>

            <div className="p-6 sm:p-8">
                {/* Author row */}
                <div className="flex items-center gap-3 mb-4">
                    <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-10 h-10 rounded-full bg-cat-tan border border-stone-100"
                    />
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-text-brown text-sm">
                                {post.author.name}
                            </span>
                            <span className="bg-text-brown text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                                {post.author.badge}
                            </span>
                        </div>
                        <p className="text-xs text-stone-400">{post.date}</p>
                    </div>
                    <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${post.tagColor}`}
                    >
                        {post.tag}
                    </span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-playfair font-bold text-text-brown mb-4 leading-snug">
                    {post.title}
                </h2>

                {/* Body */}
                <div className="text-stone-600 text-sm sm:text-base">
                    {renderBody(post.body)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-5 mt-6 pt-5 border-t border-stone-100">
                    <button
                        onClick={() => setLiked((p) => !p)}
                        className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${liked ? "text-rose-500" : "text-stone-400 hover:text-rose-400"}`}
                    >
                        <Heart className={`w-4 h-4 ${liked ? "fill-rose-500" : ""}`} />
                        {post.likes + (liked ? 1 : 0)}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-text-brown transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                    </button>
                    <button className="flex items-center gap-1.5 text-sm font-medium text-stone-400 hover:text-text-brown transition-colors">
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                    <button
                        onClick={() => setSaved((p) => !p)}
                        className={`ml-auto flex items-center gap-1.5 text-sm font-medium transition-colors ${saved ? "text-text-brown" : "text-stone-400 hover:text-text-brown"}`}
                    >
                        <Bookmark className={`w-4 h-4 ${saved ? "fill-text-brown" : ""}`} />
                    </button>
                </div>
            </div>
        </article>
    );
}

// ── Main Page ────────────────────────────────────────────────────────────────
const Community = () => {
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
                <h2 className="text-2xl font-semibold text-text-brown">Latest Posts</h2>
                {POSTS.map((post) => (
                    <PostCard key={post.id} post={post} />
                ))}
            </section>
        </div>
    );
};

export default Community;
