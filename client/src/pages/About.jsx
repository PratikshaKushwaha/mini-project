import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Heart, Shield, Zap, Users } from 'lucide-react';

const VALUES = [
    {
        icon: Heart,
        title: 'Passion for Craft',
        desc: 'We believe every handcrafted creation carries a piece of the artist\'s soul. Our platform is built to honour that.',
    },
    {
        icon: Shield,
        title: 'Trust & Transparency',
        desc: 'Honest reviews, clear pricing, and secure transactions — because trust is the foundation of every great collaboration.',
    },
    {
        icon: Zap,
        title: 'Empowering Artists',
        desc: 'We put artists first. From easy portfolio setup to fair commissions, everything is designed to help creators thrive.',
    },
    {
        icon: Users,
        title: 'Community Driven',
        desc: 'ArtisanConnect is more than a marketplace. It\'s a growing community of makers, dreamers, and appreciators of art.',
    },
];

const TEAM = [
    {
        name: 'Pratiksha Kushwaha',
        role: 'Founder & Developer',
        image: 'https://api.dicebear.com/7.x/notionists/svg?seed=pratiksha',
        bio: 'Built ArtisanConnect to bridge the gap between talented local artists and clients who value handmade work.',
    },
];

const About = () => {
    return (
        <div className="bg-bg-cream min-h-screen pb-20">

            {/* Hero */}
            <section className="relative overflow-hidden pt-20 pb-24 border-b border-stone-200/60">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-10 right-20 w-80 h-80 bg-cat-mocha/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-10 w-64 h-64 bg-cat-tan/30 rounded-full blur-3xl" />
                </div>
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 relative z-10 text-center">
                    <span className="inline-block bg-white/70 backdrop-blur-sm border border-stone-200/60 text-text-brown text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
                        Our Story
                    </span>
                    <h1 className="text-5xl sm:text-7xl font-playfair font-bold text-text-brown leading-[1.1] mb-6">
                        Art Deserves a<br />Better Stage
                    </h1>
                    <p className="text-stone-600 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
                        ArtisanConnect was born from a simple belief — that local artists deserve visibility, 
                        and clients deserve access to authentic, handcrafted creativity.
                    </p>
                </div>
            </section>

            {/* Mission */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-4xl font-playfair font-bold text-text-brown mb-6 leading-tight">
                            Our Mission
                        </h2>
                        <p className="text-stone-600 text-lg leading-relaxed mb-6">
                            We're on a mission to make it effortless for talented artists to earn a living doing what they love — 
                            and equally effortless for clients to find the perfect artist for any project.
                        </p>
                        <p className="text-stone-600 leading-relaxed mb-8">
                            From intricate mehendi designs to digital illustrations, crochet keepsakes to professional portraits — 
                            ArtisanConnect is the home for every form of artistic expression.
                        </p>
                        <Link
                            to="/artists"
                            className="inline-flex items-center gap-2 bg-text-brown text-white px-7 py-3 rounded-full font-medium hover:bg-opacity-90 transition"
                        >
                            Explore Artists <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="relative h-80 lg:h-[420px]">
                        <div className="absolute inset-0 bg-cat-mocha/10 rounded-[3rem]" />
                        <img
                            src="https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=700&h=500&fit=crop&q=80"
                            alt="Artist at work"
                            className="absolute inset-0 w-full h-full object-cover rounded-[3rem]"
                        />
                    </div>
                </div>
            </section>

            {/* Values */}
            <section className="bg-white border-y border-stone-200/60 py-20">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-playfair font-bold text-text-brown mb-3">What We Stand For</h2>
                        <p className="text-stone-500 max-w-xl mx-auto">Our values guide every decision we make — from how we build the product to how we support our community.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map(({ icon: Icon, title, desc }) => (
                            <div key={title} className="bg-bg-cream rounded-3xl p-7 flex flex-col gap-4">
                                <div className="w-11 h-11 bg-cat-tan/40 rounded-2xl flex items-center justify-center">
                                    <Icon className="w-5 h-5 text-text-brown" strokeWidth={1.5} />
                                </div>
                                <h3 className="font-bold text-text-brown text-lg">{title}</h3>
                                <p className="text-stone-500 text-sm leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Team */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8 py-20">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-playfair font-bold text-text-brown mb-3">Meet the Team</h2>
                    <p className="text-stone-500 max-w-lg mx-auto">The passionate people behind ArtisanConnect.</p>
                </div>
                <div className="flex justify-center gap-8 flex-wrap">
                    {TEAM.map(member => (
                        <div key={member.name} className="bg-white rounded-3xl p-8 shadow-sm text-center max-w-xs w-full">
                            <img
                                src={member.image}
                                alt={member.name}
                                className="w-24 h-24 rounded-full mx-auto mb-4 bg-cat-tan border-4 border-bg-cream"
                            />
                            <h3 className="font-bold text-text-brown text-xl mb-0.5">{member.name}</h3>
                            <p className="text-xs font-semibold text-muted-taupe uppercase tracking-wide mb-3">{member.role}</p>
                            <p className="text-stone-500 text-sm leading-relaxed">{member.bio}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-[1400px] mx-auto px-4 sm:px-6 xl:px-8">
                <div className="bg-cat-mocha/20 rounded-[3rem] p-12 text-center relative overflow-hidden border border-cat-mocha/10">
                    <div className="absolute -top-16 -right-16 w-64 h-64 bg-cat-mocha/10 rounded-full blur-3xl pointer-events-none" />
                    <div className="relative z-10">
                        <h2 className="text-4xl font-playfair font-bold text-text-brown mb-4">Ready to Join?</h2>
                        <p className="text-stone-600 mb-8 max-w-md mx-auto">Whether you're an artist or a client, there's a place for you at ArtisanConnect.</p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                to="/register?role=artist"
                                className="bg-text-brown text-white px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition inline-flex items-center gap-2"
                            >
                                Join as Artist <ChevronRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/register"
                                className="bg-white text-text-brown border border-text-brown/20 px-8 py-3 rounded-full font-medium hover:border-text-brown transition"
                            >
                                Join as Client
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;
