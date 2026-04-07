import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, ArrowRight, Tag } from 'lucide-react';
import GradientText from '../components/GradientText';

const Blog = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    const posts = [
        {
            id: 1,
            title: "The Art of Banarasi: History and Weaving",
            excerpt: "Explore the ancient heritage of Banarasi sarees and the meticulous craftsmanship that goes into every thread...",
            date: "Mar 12, 2026",
            author: "Team Vastra",
            tag: "Heritage",
            image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 2,
            title: "Choosing the Right Saree for Summer Weddings",
            excerpt: "Stay cool and graceful with our guide to choosing lightweight silk and handloom cottons for hot summer celebrations...",
            date: "Mar 05, 2026",
            author: "Style Guide",
            tag: "Tips",
            image: "https://images.unsplash.com/photo-1583391733958-e026f39a4823?q=80&w=1000&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Care Guide: Maintaining Your Handloom Sarees",
            excerpt: "Valuable tips and tricks for storing and cleaning your precious handloom pieces to ensure they last generations...",
            date: "Feb 28, 2026",
            author: "Maintenance",
            tag: "Care",
            image: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=1000&auto=format&fit=crop"
        }
    ];

    return (
        <div className="min-h-screen pt-24 pb-16 bg-gradient-to-br from-teal-50 via-white to-pink-50">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <div className="mb-8">
                    <Link to="/home" className="inline-flex items-center text-gray-500 hover:text-vastra-teal transition-colors font-medium">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Home
                    </Link>
                </div>

                {/* Header Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
                        Vastra <GradientText text="Kuteer Chronicles" />
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Discover the stories, traditions, and style guides from the heart of Indian ethnic wear.
                    </p>
                </div>

                {/* Blog Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {posts.map((post) => (
                        <article key={post.id} className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-teal-50 hover:shadow-2xl transition-all duration-300">
                            <div className="relative h-64 overflow-hidden">
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                />
                                <div className="absolute top-4 left-4">
                                    <span className="bg-vastra-teal text-white px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-lg">
                                        <Tag size={12} className="mr-1" /> {post.tag}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center text-gray-400 text-xs gap-4 mb-4">
                                    <span className="flex items-center"><Calendar size={14} className="mr-1" /> {post.date}</span>
                                    <span className="flex items-center"><User size={14} className="mr-1" /> {post.author}</span>
                                </div>
                                <h2 className="text-2xl font-serif font-bold text-gray-900 mb-4 group-hover:text-vastra-teal transition-colors leading-tight">
                                    {post.title}
                                </h2>
                                <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                                    {post.excerpt}
                                </p>
                                <button className="inline-flex items-center text-vastra-teal font-bold text-sm hover:gap-2 transition-all">
                                    Read Full Story <ArrowRight size={16} className="ml-2" />
                                </button>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Pagination Placeholder */}
                <div className="mt-16 flex justify-center">
                    <button className="px-8 py-3 border-2 border-vastra-teal text-vastra-teal font-bold rounded-xl hover:bg-vastra-teal hover:text-white transition-all shadow-lg active:scale-95">
                        Load More Stories
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Blog;
