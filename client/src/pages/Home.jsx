import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import GradientText from '../components/GradientText';
import { ArrowRight, Star, TrendingUp, Truck, ShieldCheck, RefreshCw } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import { API_URL } from '../config';
import { useState, useEffect } from 'react';

const SkeletonCard = () => (
    <div className="rounded-xl overflow-hidden animate-pulse" style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(219,234,254,0.4)' }}>
        <div className="aspect-[4/5] bg-purple-100/50" />
        <div className="p-4 space-y-2">
            <div className="h-3 bg-purple-100 rounded w-1/3" />
            <div className="h-4 bg-purple-100 rounded w-2/3" />
            <div className="h-4 bg-purple-100 rounded w-1/2" />
        </div>
    </div>
);

const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recentlyViewed, setRecentlyViewed] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch products only
                const prodRes = await axios.get(`${API_URL}/api/products`);
                const productData = prodRes.data;
                setProducts(productData);

                // Derive categories
                const uniqueCategoryNames = [...new Set(productData.map(p => p.category).filter(Boolean))];
                const derivedCategories = uniqueCategoryNames.map((name, index) => {
                    const catProducts = productData.filter(p => p.category === name);
                    const showOnHome = catProducts.some(p => p.showOnHome === true);
                    const featuredProduct = catProducts.find(p => p.showOnHome) || catProducts[0];
                    return {
                        _id: `derived_${index}`,
                        name: name,
                        image: featuredProduct.image,
                        showOnHome: showOnHome
                    };
                });

                setCategories(derivedCategories);

                // Update recently viewed to hide sold out items using fresh data
                const rv = JSON.parse(localStorage.getItem('recently_viewed') || '[]');

                const freshRv = rv.map(localItem => {
                    const freshItem = productData.find(p => p._id === localItem._id);
                    // If item was completely deleted from DB, return null so we can filter it out
                    if (!freshItem) return null;
                    return { ...localItem, ...freshItem };
                })
                    // Filter out nulls (deleted items) AND items that are marked as sold out
                    .filter(item => item !== null && !item.isSoldOut);

                setRecentlyViewed(freshRv);

                // Optionally sync back up the cleaned list to localStorage so dead items don't linger forever
                localStorage.setItem('recently_viewed', JSON.stringify(freshRv));

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Load recently viewed from localStorage immediately for fast display
        const initialRv = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        // We initially hide anything strictly marked sold out in localStorage too
        setRecentlyViewed(initialRv.filter(item => !item.isSoldOut));
    }, []);

    return (
        <div className="min-h-screen">

            {/* Hero Section */}
            <div className="relative" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 60%, #F5F3FF 100%)' }}>
                <div className="absolute inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 65% 50%, rgba(124,58,237,0.08) 0%, transparent 60%)' }}></div>
                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-fade-in-up">
                            <span className="text-vastra-teal font-semibold tracking-wider text-sm uppercase">Welcome to Vastra Kuteer</span>
                            <h1 className="text-5xl lg:text-7xl font-serif font-bold text-vastra-black leading-tight">
                                Weave Your <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#065f46] via-[#0d9488] to-[#0891b2]">Tradition</span> With<br />
                                <GradientText text="Elegance" variant="elegant" />
                            </h1>
                            <p className="text-xl text-gray-600 max-w-lg">
                                Discover the finest collection of handcrafted sarees and ethnic wear that tells a story of heritage and grace.
                            </p>
                            <div className="flex space-x-4">
                                <Link to="/collections" className="btn-primary flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all">
                                    Shop Collection <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link to="/shop" className="btn-secondary flex items-center justify-center">
                                    View Lookbook
                                </Link>
                            </div>
                            <div className="flex items-center space-x-8 pt-8">
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-vastra-black">5k+</span>
                                    <span className="text-gray-500 text-sm">Premium Products</span>
                                </div>
                                <div className="h-10 w-px bg-emerald-200"></div>
                                <div className="flex flex-col">
                                    <span className="text-3xl font-bold text-vastra-black">20k+</span>
                                    <span className="text-gray-500 text-sm">Happy Customers</span>
                                </div>
                            </div>
                        </div>

                        {/* Hero Image Placeholder - Ideally use the generated peacock image here */}
                        <div className="relative">
                            <div className="absolute top-0 right-0 -mr-4 -mt-4 w-72 h-72 bg-vastra-gold/20 rounded-full blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-72 h-72 bg-vastra-teal/20 rounded-full blur-3xl"></div>
                            <div className="rounded-t-[10rem] rounded-b-[2rem] shadow-2xl relative z-10 w-full h-[600px] border-4 border-vastra-bg overflow-hidden bg-zinc-900">
                                <img
                                    src="/hero-mannequin.jpg.png"
                                    alt="Blue Banarasi Saree on Mannequin"
                                    className="w-full h-full object-contain transform scale-[1.08] origin-top-left"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1596465451995-1fc82668ca77?q=80&w=2574&auto=format&fit=crop'; }}
                                />
                            </div>

                            {/* Floating Card */}
                            <div className="absolute bottom-12 -left-8 p-4 rounded-xl shadow-lg z-20 max-w-xs animate-bounce-slow" style={{ background: 'rgba(240,253,250,0.95)', border: '1px solid rgba(13,148,136,0.20)' }}>
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className="p-2 rounded-full" style={{ background: 'rgba(201,150,12,0.15)', color: '#C9960C' }}>
                                        <Star className="h-4 w-4 fill-current" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-vastra-black">Top Rated</p>
                                        <p className="text-xs text-gray-500">Banarasi Silk Saree</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16" style={{ background: '#F0FDFA', borderTop: '1px solid rgba(13,148,136,0.1)', borderBottom: '1px solid rgba(13,148,136,0.1)' }}>
                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { icon: Truck, title: "Free Shipping", desc: "Above ₹1999" },
                            { icon: ShieldCheck, title: "Secure Pay", desc: "100% Safe" },
                            { icon: RefreshCw, title: "Easy Returns", desc: "7-Day Policy" },
                            { icon: TrendingUp, title: "Authentic", desc: "100% Original" },
                        ].map((feature, idx) => (
                            <div key={idx} className="flex flex-col items-center text-center p-4 md:p-6 rounded-xl hover:shadow-lg transition-all group cursor-default" style={{ background: 'rgba(240,253,250,0.85)', border: '1px solid rgba(13,148,136,0.15)' }}>
                                <feature.icon className="h-6 w-6 md:h-10 md:w-10 text-vastra-teal mb-3 group-hover:scale-110 transition-transform" />
                                <h3 className="font-semibold text-vastra-black mb-1 text-xs md:text-base">{feature.title}</h3>
                                <p className="text-[10px] md:text-sm text-gray-500 line-clamp-1">{feature.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-16" style={{ background: '#FAF9FF' }}>
                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <span className="text-vastra-teal font-semibold tracking-wider text-sm uppercase">Hot This Season</span>
                        <h2 className="text-4xl font-serif font-bold text-vastra-black mt-2">
                            <GradientText text="Trending Now" />
                        </h2>
                        <div className="h-1 w-20 bg-vastra-gold mx-auto mt-4"></div>
                    </div>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.filter(p => p.showOnHome).map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-12">
                        <Link to="/shop" className="inline-block px-8 py-3 font-semibold rounded-full transition-all shadow-lg hover:shadow-xl hover:opacity-90 text-white" style={{ background: 'linear-gradient(135deg,#00C97D,#009960)' }}>View All Products</Link>
                    </div>
                </div>
            </div>

            {/* Categories Preview */}
            <div className="py-16" style={{ background: '#F0FDFA', borderTop: '1px solid rgba(13,148,136,0.1)', borderBottom: '1px solid rgba(13,148,136,0.1)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-vastra-teal font-semibold tracking-wider text-sm uppercase">Shop By Category</span>
                        <h2 className="text-4xl font-serif font-bold text-vastra-black mt-2">
                            <GradientText text="Curated Collections" />
                        </h2>
                        <div className="h-1 w-20 bg-vastra-gold mx-auto mt-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {categories.filter(c => c.showOnHome).length > 0 ? categories.filter(c => c.showOnHome).slice(0, 3).map((cat) => (
                            <Link to={`/shop?category=${encodeURIComponent(cat.name)}`} key={cat._id} className="relative group overflow-hidden rounded-2xl h-96 cursor-pointer block">
                                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-8">
                                    <div className="text-center transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0">
                                        <h3 className="text-2xl font-serif text-white mb-2">{cat.name}</h3>
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span className="text-vastra-gold text-sm font-medium tracking-wide uppercase border-b border-vastra-gold pb-1">Explore Now</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )) : (
                            <div className="col-span-3 text-center text-gray-500">
                                <p>No categories available. Please add categories from the admin dashboard.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Recently Viewed Section */}
            {recentlyViewed.length > 0 && (
                <div className="py-16" style={{ background: '#FFF7ED', borderTop: '1px solid rgba(201,150,12,0.1)' }}>
                    <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-10">
                            <span className="text-vastra-gold font-semibold tracking-wider text-sm uppercase">Recently Viewed</span>
                            <h2 className="text-3xl font-serif font-bold text-vastra-black mt-2">Continue Browsing</h2>
                            <div className="h-1 w-16 bg-vastra-teal mx-auto mt-3"></div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {recentlyViewed.map((item) => (
                                <div key={item._id} onClick={() => navigate(`/product/${item._id}`)} className="cursor-pointer group rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all" style={{ background: 'rgba(255,255,255,0.8)' }}>
                                    <div className="aspect-[4/5] overflow-hidden">
                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-xs text-vastra-gold font-medium truncate">{item.brand}</p>
                                        <p className="text-sm font-medium text-gray-900 truncate leading-tight">{item.name}</p>
                                        <p className="text-sm font-bold text-gray-900 mt-1">₹{item.price}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
