import React from 'react';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const ProductCard = ({ product }) => {
    const { addToCart, cartItems } = useCart();
    const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
    const [isLiked, setIsLiked] = React.useState(false);

    React.useEffect(() => {
        setIsLiked(isFavorite(product._id));
    }, [product._id, isFavorite]);

    const navigate = useNavigate();

    const handleCardClick = () => {
        navigate(`/product/${product._id}`);
    };

    const handleBuyNow = (e) => {
        e.stopPropagation(); // Prevent parent click
        navigate(`/product/${product._id}`);
    };

    const handleToggleFavorite = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLiked) {
            removeFromFavorites(product._id);
        } else {
            addToFavorites(product);
        }
        // Optimistic update handles state via context, but local state toggle for immediate feedback
        setIsLiked(!isLiked);
    };

    return (
        <div
            onClick={handleCardClick}
            className={`group rounded-xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border border-pink-100/30 relative cursor-pointer backdrop-blur-sm ${product.isSoldOut ? 'opacity-75' : ''}`}
            style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(253,242,248,0.6) 100%)' }}
        >
            {/* Sold Out Overlay */}
            {product.isSoldOut && (
                <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center">
                    <span className="px-6 py-2 bg-red-600 text-white font-bold text-lg tracking-wider transform -rotate-12 shadow-lg border-2 border-white">
                        SOLD OUT
                    </span>
                </div>
            )}

            <div className="relative aspect-[4/5] overflow-hidden bg-gray-100">
                <button
                    type="button"
                    onClick={handleToggleFavorite}
                    className="absolute top-1 right-1 sm:top-2 sm:right-2 z-30 p-1 sm:p-2 bg-vastra-bg/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-vastra-bg transition-all transform hover:scale-110"
                    aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
                >
                    <Heart className={`w-3 h-3 sm:w-5 sm:h-5 ${isLiked ? 'fill-red-600 text-red-600' : 'text-gray-600'}`} />
                </button>
                <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                {!product.isSoldOut && (
                    <div className="absolute inset-x-0 bottom-0 p-1 sm:p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-center pb-2 sm:pb-6">
                        <button
                            onClick={handleBuyNow}
                            className="bg-white/90 backdrop-blur-sm text-gray-900 px-2 py-1 sm:px-6 sm:py-2 rounded-full font-medium text-[8px] sm:text-sm shadow-lg hover:bg-vastra-teal hover:text-white transition-all flex items-center transform translate-y-4 group-hover:translate-y-0 duration-300"
                        >
                            <ShoppingBag className="w-2 h-2 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                            <span className="hidden xs:inline">Details</span>
                        </button>
                    </div>
                )}
            </div>

            <div className="p-1.5 sm:p-4">
                <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                    <p className="text-[6px] sm:text-xs font-medium text-vastra-gold tracking-wider uppercase truncate max-w-[60%]">{product.brand}</p>
                    <div className="flex items-center bg-vastra-bg px-1 py-0.5 rounded text-[7px] sm:text-xs font-medium text-gray-600">
                        <Star className="w-2 h-2 sm:w-3 sm:h-3 text-yellow-500 fill-current mr-0.5" />
                        {product.rating}
                    </div>
                </div>
                <h3 className="text-gray-900 font-medium leading-tight mb-1 sm:mb-2 group-hover:text-vastra-teal transition-colors line-clamp-1 text-[8px] sm:text-base">{product.name}</h3>
                <div className="flex items-baseline flex-wrap gap-1 sm:gap-2">
                    <span className="text-[9px] sm:text-lg font-bold text-gray-900">₹{product.price}</span>
                    <span className="text-[7px] sm:text-sm text-gray-400 line-through hidden sm:inline">₹{product.originalPrice}</span>
                    <span className="text-[6px] sm:text-xs font-medium text-green-600 px-1 py-0.5 bg-green-50 rounded hidden xs:inline">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
