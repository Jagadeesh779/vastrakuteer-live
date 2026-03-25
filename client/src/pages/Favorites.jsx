import React, { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import GradientText from '../components/GradientText';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SkeletonCard } from '../components/SkeletonLoaders';
import { API_URL } from '../config';

const Favorites = () => {
    const { favorites } = useFavorites();
    const [favoriteProducts, setFavoriteProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProductDetails = async () => {
            setLoading(true);
            try {
                const response = await fetch(`${API_URL}/api/products`);
                const products = await response.json();
                const filtered = products.filter(p => favorites.includes(p._id));
                setFavoriteProducts(filtered);
            } catch (error) {
                console.error("Error loading favorite products", error);
            } finally {
                setLoading(false);
            }
        };

        if (favorites.length > 0) {
            fetchProductDetails();
        } else {
            setFavoriteProducts([]);
            setLoading(false);
        }
    }, [favorites]);

    if (loading) {
        return (
            <div className="min-h-screen pt-10 pb-20" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center space-x-4 mb-8">
                        <Heart className="h-8 w-8 text-red-400" />
                        <h1 className="text-3xl font-serif text-gray-900 font-bold">
                            <GradientText text="My Favorites" />
                        </h1>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-10 pb-20" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center space-x-4 mb-8">
                    <Heart className="h-8 w-8 text-red-600 fill-red-600" />
                    <h1 className="text-3xl font-serif text-gray-900 font-bold">
                        <GradientText text="My Favorites" />
                    </h1>
                    {favoriteProducts.length > 0 && (
                        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200">
                            {favoriteProducts.length} {favoriteProducts.length === 1 ? 'item' : 'items'}
                        </span>
                    )}
                </div>

                {favoriteProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-violet-100">
                        <div className="relative w-28 h-28 mx-auto mb-6">
                            <div className="absolute inset-0 rounded-full bg-red-50 animate-ping opacity-20" />
                            <div className="relative w-28 h-28 rounded-full bg-red-50 flex items-center justify-center">
                                <Heart className="h-14 w-14 text-red-300" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-gray-800 mb-2">
                            <GradientText text="Your wishlist is empty" />
                        </h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Browse our collection and tap the ♡ heart icon to save your favourite pieces here.
                        </p>
                        <Link
                            to="/shop"
                            className="inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                            style={{ background: 'linear-gradient(135deg, #7c3aed, #0d9488)' }}
                        >
                            <ShoppingBag className="h-4 w-4" /> Explore Shop
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {favoriteProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Favorites;
