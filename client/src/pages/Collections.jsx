import React, { useState, useEffect } from 'react';
import axios from 'axios';
import GradientText from '../components/GradientText';
import { API_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 12;

const SkeletonCategory = () => (
    <div className="rounded-2xl h-96 overflow-hidden animate-pulse" style={{ background: 'rgba(245,243,255,0.8)' }}>
        <div className="w-full h-full bg-purple-100/60" />
    </div>
);

const Collections = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch products instead of categories
                const res = await axios.get(`${API_URL}/api/products`);
                const productData = res.data;

                // Derive categories
                const uniqueCategoryNames = [...new Set(productData.map(p => p.category).filter(Boolean))];
                const derivedCategories = uniqueCategoryNames.map((name, index) => {
                    const catProducts = productData.filter(p => p.category === name);
                    const showOnCollections = catProducts.some(p => p.showOnCollections !== false);
                    const featured = catProducts.find(p => p.showOnCollections) || catProducts[0];

                    return {
                        _id: `derived_${index}`,
                        name: name,
                        image: featured.image,
                        showOnCollections: showOnCollections,
                        itemCount: catProducts.length
                    };
                });

                setCategories(derivedCategories);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching categories:", err);
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCategoryClick = (categoryName) => {
        navigate(`/shop?category=${encodeURIComponent(categoryName)}`);
    };

    return (
        <div className="min-h-screen pt-8 pb-20" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-vastra-pink font-semibold tracking-wider text-sm uppercase">Browse By Category</span>
                    <h1 className="text-4xl font-serif font-bold text-gray-900 mt-2">
                        <GradientText text="Our Collections" />
                    </h1>
                    <div className="h-1 w-20 bg-vastra-pink mx-auto mt-4"></div>
                    <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                        Explore our wide range of handcrafted ethnic wear, categorized for your convenience.
                    </p>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array(6).fill(0).map((_, i) => <SkeletonCategory key={i} />)}
                    </div>
                ) : (
                    (() => {
                        const visibleCats = categories.filter(c => c.showOnCollections);
                        const totalPages = Math.ceil(visibleCats.length / ITEMS_PER_PAGE);
                        const paginated = visibleCats.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
                        return (<>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginated.length > 0 ? paginated.map((cat) => (
                                    <div
                                        key={cat._id}
                                        onClick={() => handleCategoryClick(cat.name)}
                                        className="relative group overflow-hidden rounded-2xl h-96 cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                                    >
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-center pb-8">
                                            <div className="text-center transform transition-transform duration-300 translate-y-4 group-hover:translate-y-0 px-4">
                                                <h3 className="text-3xl font-serif text-white mb-2">{cat.name}</h3>
                                                <p className="text-gray-300 text-sm mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                    {cat.itemCount} {cat.itemCount === 1 ? 'Item' : 'Items'}
                                                </p>
                                                <div className="inline-block opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                                    <span className="text-vastra-pink text-sm font-medium tracking-wide uppercase border-b border-vastra-pink pb-1">View Products</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="col-span-3 text-center text-gray-500 py-12">
                                        <p>No collections found.</p>
                                    </div>
                                )}
                            </div>
                            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
                        </>);
                    })()
                )}
            </div>
        </div>
    );
};

export default Collections;
