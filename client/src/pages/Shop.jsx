import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import GradientText from '../components/GradientText';
import { AlertCircle } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../components/Pagination';
import { SkeletonCard } from '../components/SkeletonLoaders';

const ITEMS_PER_PAGE = 12;

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [currentPage, setCurrentPage] = useState(1);
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const prodRes = await axios.get(`${API_URL}/api/products`);
                const productData = prodRes.data;
                setProducts(productData);

                const uniqueCategoryNames = [...new Set(productData.map(p => p.category).filter(Boolean))];
                const derivedCategories = uniqueCategoryNames.map((name, index) => {
                    const catProducts = productData.filter(p => p.category === name);
                    const showOnShop = catProducts.some(p => p.showOnShop !== false);
                    return { _id: `derived_${index}`, name, showOnShop };
                });
                setCategories(derivedCategories);

                const categoryParam = searchParams.get('category');
                if (categoryParam) setSelectedFilters([categoryParam]);

                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setLoading(false);
            }
        };
        fetchData();
    }, [searchParams]);

    const handleFilterChange = (categoryName) => {
        setSelectedFilters(prev =>
            prev.includes(categoryName) ? prev.filter(c => c !== categoryName) : [...prev, categoryName]
        );
    };

    const filteredProducts = products
        .filter(product => {
            if (product.showOnShop === false) return false;
            const searchQuery = searchParams.get('search')?.toLowerCase() || '';
            if (searchQuery) {
                const content = (product.name + ' ' + product.brand + ' ' + (product.category || '')).toLowerCase();
                if (!content.includes(searchQuery)) return false;
            }
            if (selectedFilters.length > 0) {
                if (product.category) {
                    if (!selectedFilters.includes(product.category)) return false;
                } else {
                    const content = (product.name + ' ' + product.brand).toLowerCase();
                    if (!selectedFilters.some(f => content.includes(f.toLowerCase()))) return false;
                }
            }
            if (priceMin !== '' && product.price < Number(priceMin)) return false;
            if (priceMax !== '' && product.price > Number(priceMax)) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'price_asc') return a.price - b.price;
            if (sortBy === 'price_desc') return b.price - a.price;
            if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
            return 0;
        });

    // Reset to page 1 whenever filters/sort/search changes
    useEffect(() => { setCurrentPage(1); }, [selectedFilters, priceMin, priceMax, sortBy, searchParams]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    return (
        <div className="min-h-screen pt-8 pb-20" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Header - Forced Left Alignment for Mobile */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 border-b border-gray-200 pb-6 w-full">
                    <div className="w-full md:w-auto text-left">
                        <span className="text-gray-500 text-sm">Home / Clothing / Shop</span>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mt-2">
                            <GradientText text="Shop Collection" /> <span className="text-gray-500 text-lg font-sans font-normal">({filteredProducts.length} items)</span>
                        </h1>
                    </div>
                    {/* Sort Dropdown - Explicitly Left Aligned on Mobile */}
                    <div className="mt-4 md:mt-0 w-full md:w-auto text-left">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-4 py-2 rounded-xl border border-violet-200 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-300"
                            style={{ background: 'rgba(245,243,255,0.9)' }}
                        >
                            <option value="newest">Sort: Newest</option>
                            <option value="price_asc">Price: Low → High</option>
                            <option value="price_desc">Price: High → Low</option>
                            <option value="rating">Top Rated</option>
                        </select>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-12 md:gap-8">
                    {/* Filters Sidebar - Relative on mobile, Sticky on desktop */}
                    <div className="w-full md:w-64 flex-shrink-0 p-6 rounded-2xl shadow-xl h-fit md:sticky md:top-24 relative z-10 backdrop-blur-md border border-violet-200/30" style={{ background: 'linear-gradient(135deg, rgba(245,243,255,0.85) 0%, rgba(250,249,255,0.70) 100%)' }}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-sm">Filters</h3>
                            <button onClick={() => { setSelectedFilters([]); setPriceMin(''); setPriceMax(''); }} className="text-xs text-vastra-pink hover:underline">Clear All</button>
                        </div>

                        {/* Categories */}
                        <div className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Categories</h4>
                            <div className="space-y-2">
                                {categories.filter(c => c.showOnShop).length > 0 ? categories.filter(c => c.showOnShop).map((cat) => (
                                    <label key={cat._id} className="flex items-center space-x-3 cursor-pointer group">
                                        <input type="checkbox" checked={selectedFilters.includes(cat.name)} onChange={() => handleFilterChange(cat.name)} className="form-checkbox h-4 w-4 text-vastra-pink border-gray-300 rounded focus:ring-vastra-pink" />
                                        <span className={`text-sm group-hover:text-vastra-blue transition-colors ${selectedFilters.includes(cat.name) ? 'font-medium text-vastra-teal' : 'text-gray-600'}`}>{cat.name}</span>
                                    </label>
                                )) : (
                                    <p className="text-sm text-gray-400 italic">No categories found</p>
                                )}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div className="mb-2">
                            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Price Range (₹)</h4>
                            <div className="flex items-center gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={priceMin}
                                    onChange={e => setPriceMin(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-violet-200 focus:outline-none focus:ring-1 focus:ring-violet-300"
                                    style={{ background: 'rgba(250,249,255,0.9)' }}
                                />
                                <span className="text-gray-400 text-sm">–</span>
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={priceMax}
                                    onChange={e => setPriceMax(e.target.value)}
                                    className="w-full px-2 py-1.5 text-sm rounded-lg border border-violet-200 focus:outline-none focus:ring-1 focus:ring-violet-300"
                                    style={{ background: 'rgba(250,249,255,0.9)' }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <>
                                <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-6">
                                    {paginatedProducts.map((product) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                />
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 rounded-2xl shadow-xl border border-violet-200/30 backdrop-blur-md" style={{ background: 'rgba(250,249,255,0.70)' }}>
                                <div className="p-4 bg-gray-50 rounded-full mb-4">
                                    <AlertCircle className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No products match your filters</h3>
                                <p className="text-gray-500 mt-1">Try clearing filters or check back later!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Shop;
