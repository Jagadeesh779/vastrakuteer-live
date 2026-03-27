import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import { Star, ShoppingBag, ZoomIn, Heart, ShieldCheck, Ruler, Truck, RefreshCcw, Camera, Image as ImageIcon, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import ImageZoom from '../components/ImageZoom';
import GradientText from '../components/GradientText';


const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const { addToCart, cartItems } = useCart();
    const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
    const { showToast } = useToast();
    const [mainImage, setMainImage] = useState('');
    const [selectedSize, setSelectedSize] = useState(null);
    const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false);
    const [isReviewPhotoUploading, setIsReviewPhotoUploading] = useState(false);


    // Review State
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', image: '' });
    const [reviews, setReviews] = useState([]);
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products/${id}`);
                const p = res.data;
                setProduct(p);
                setMainImage(p.image);
                setReviews(p.reviewsList || []);
                // Auto-select 'Saree' if it's the only size with stock
                if (p.sizes) {
                    const availableSizes = Object.entries(p.sizes).filter(([, qty]) => qty > 0).map(([s]) => s);
                    if (availableSizes.length === 1 && availableSizes[0] === 'Saree') {
                        setSelectedSize('Saree');
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Error fetching product:", err);
                try {
                    const allRes = await axios.get(`${API_URL}/api/products`);
                    const found = allRes.data.find(p => p._id === id);
                    if (found) {
                        setProduct(found);
                        setMainImage(found.image);
                        setReviews(found.reviewsList || []);
                        if (found.sizes) {
                            const availableSizes = Object.entries(found.sizes).filter(([, qty]) => qty > 0).map(([s]) => s);
                            if (availableSizes.length === 1 && availableSizes[0] === 'Saree') {
                                setSelectedSize('Saree');
                            }
                        }
                    }
                    setLoading(false);
                } catch (e) {
                    setLoading(false);
                }
            }
        };
        fetchProduct();
    }, [id]);

    // Track recently viewed
    useEffect(() => {
        if (!product) return;
        const existing = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
        const filtered = existing.filter(p => p._id !== product._id);
        const updated = [{ _id: product._id, name: product.name, image: product.image, price: product.price, brand: product.brand, rating: product.rating }, ...filtered].slice(0, 4);
        localStorage.setItem('recently_viewed', JSON.stringify(updated));
    }, [product]);

    if (loading) {
        return (
            <div className="min-h-screen py-10 bg-gray-50">
                <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="h-4 bg-gray-200 rounded w-48 mb-6 animate-pulse"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="aspect-[3/4] rounded-2xl bg-gray-200 animate-pulse w-full"></div>
                            <div className="flex space-x-4">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-20 h-20 bg-gray-200 rounded-md animate-pulse flex-shrink-0"></div>)}
                            </div>
                        </div>
                        <div className="space-y-6 mt-4">
                            <div>
                                <div className="h-8 bg-gray-200 rounded w-3/4 mb-3 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                            </div>
                            <div className="h-10 bg-gray-200 rounded w-1/3 mt-6 animate-pulse"></div>
                            <div className="space-y-3 mt-8">
                                <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
                            </div>
                            <div className="h-12 bg-gray-200 rounded-full w-full animate-pulse mt-8"></div>
                            <div className="h-12 bg-gray-200 rounded-full w-full animate-pulse mt-4"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
    if (!product) return <div className="text-center py-20 text-xl">Product not found</div>;

    const discountPercentage = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

    return (
        <div className="min-h-screen py-10" style={{ background: 'linear-gradient(135deg, #F0FDFA 0%, #E0F2F1 100%)' }}>
            <div className="max-w-[90%] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="text-sm text-gray-500 mb-6">
                    <span onClick={() => navigate('/home')} className="cursor-pointer hover:text-vastra-teal">Home</span> &gt;
                    <span onClick={() => navigate('/shop')} className="cursor-pointer hover:text-vastra-teal ml-1">Shop</span> &gt;
                    <span className="font-medium text-gray-900 ml-1">{product.name}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Image Section */}
                    <div className="space-y-4 w-full mx-auto md:ml-auto md:mr-0" style={{ maxWidth: '450px' }}>
                        {/* Main Image Viewer */}
                        <div className="relative">
                            <ImageZoom src={mainImage} alt={product.name} />
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (isFavorite(product._id)) {
                                        removeFromFavorites(product._id);
                                    } else {
                                        addToFavorites(product);
                                    }
                                }}
                                className="absolute top-4 right-4 bg-vastra-bg/90 p-3 rounded-full shadow-lg z-30 cursor-pointer hover:bg-vastra-bg transition-all transform hover:scale-110"
                            >
                                <Heart className={`h-6 w-6 ${isFavorite(product._id) ? 'fill-red-600 text-red-600' : 'text-gray-400'}`} />
                            </button>
                        </div>

                        {/* Thumbnails */}
                        <div className="flex space-x-4 overflow-x-auto pb-2 custom-scrollbar">
                            {[product.image, ...(product.images || []).filter(img => img !== product.image)].map((img, idx) => (
                                <div key={idx} onClick={() => setMainImage(img)} className={`border-2 rounded-md p-1 cursor-pointer w-20 h-20 flex-shrink-0 transition-colors ${mainImage === img ? 'border-vastra-teal' : 'border-transparent hover:border-gray-300'}`}>
                                    <img src={img} alt="" className="w-full h-full object-cover rounded-sm" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info Section */}
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">{product.name}</h1>
                        <p className="text-blue-600 font-medium text-sm mb-4">Visit the {product.brand} Store</p>

                        <div className="flex items-center space-x-4 mb-4">
                            <div className="flex text-yellow-500">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`h-5 w-5 ${i < Math.floor(product.rating || 4) ? 'fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="text-blue-600 text-sm hover:underline cursor-pointer">{product.reviews || 100} ratings</span>
                        </div>

                        <div className="border-t border-b border-gray-100 py-4 my-4">
                            <div className="flex items-baseline space-x-4">
                                <span className="text-red-600 text-2xl font-light">-{discountPercentage}%</span>
                                <span className="text-4xl font-bold text-gray-900">₹{product.price}</span>
                            </div>
                            {product.originalPrice && (
                                <p className="text-gray-500 text-sm mt-1">M.R.P.: <span className="line-through">₹{product.originalPrice}</span></p>
                            )}
                            <p className="text-gray-900 font-medium text-sm mt-2">Inclusive of all taxes</p>
                        </div>



                        {/* Size Selection — hidden for saree-only products */}
                        {product.sizes && Object.values(product.sizes).some(qty => qty > 0) &&
                            !(Object.entries(product.sizes).filter(([, qty]) => qty > 0).map(([s]) => s).join('') === 'Saree') && (
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-sm font-medium text-gray-900">Select Size</h3>
                                        <button
                                            onClick={() => setIsSizeGuideOpen(true)}
                                            className="text-vastra-teal text-xs font-semibold hover:underline flex items-center"
                                        >
                                            <Ruler className="h-3 w-3 mr-1" /> Size Guide
                                        </button>
                                    </div>
                                    <div className="flex space-x-3">
                                        {['S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Saree'].map((size) => {
                                            // 1. Get total stock for this size
                                            const totalStock = product.sizes ? product.sizes[size] : 0;

                                            // 2. Get quantity of this specific item (id + size) already in cart
                                            const cartItem = cartItems.find(item => item._id === product._id && item.selectedSize === size);
                                            const qtyInCart = cartItem ? cartItem.quantity : 0;

                                            // 3. Calculate remaining availability
                                            const availableForUser = Math.max(0, totalStock - qtyInCart);
                                            const isAvailable = availableForUser > 0;

                                            return (
                                                <button
                                                    key={size}
                                                    onClick={() => isAvailable && setSelectedSize(size)}
                                                    disabled={!isAvailable}
                                                    className={`
                                                    ${size === 'Saree' ? 'px-3 h-10 rounded-lg' : 'w-10 h-10 rounded-full'} flex items-center justify-center border text-sm font-medium transition-colors
                                                    ${selectedSize === size
                                                            ? 'border-vastra-teal bg-vastra-teal text-white'
                                                            : isAvailable
                                                                ? 'border-gray-200 text-gray-900 hover:border-gray-300'
                                                                : 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50 diagonal-strike'
                                                        }
                                                `}
                                                    title={isAvailable ? `${availableForUser} left` : 'Out of Stock (in cart/sold out)'}
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {selectedSize && (
                                        <p className="text-sm text-green-600 mt-2">
                                            {(() => {
                                                const totalStock = product.sizes ? product.sizes[selectedSize] : 0;
                                                const cartItem = cartItems.find(item => item._id === product._id && item.selectedSize === selectedSize);
                                                const qtyInCart = cartItem ? cartItem.quantity : 0;
                                                const remaining = Math.max(0, totalStock - qtyInCart);

                                                if (remaining === 0) return <span className="text-red-500">Max limit reached (check cart)</span>;
                                                if (remaining < 5) return `Hurry! Only ${remaining} left in ${selectedSize}.`;
                                                return `In Stock`;
                                            })()}
                                        </p>
                                    )}
                                </div>
                            )}

                        {/* Actions */}
                        <div className="space-y-3 max-w-sm">
                            {(() => {
                                const hasSizeStock = product.sizes && Object.values(product.sizes).some(val => val > 0);
                                const totalStock = hasSizeStock ? (selectedSize && product.sizes ? product.sizes[selectedSize] : 0) : product.count;
                                const cartItem = cartItems.find(item => item._id === product._id && item.selectedSize === selectedSize);
                                const qtyInCart = cartItem ? cartItem.quantity : 0;
                                const remaining = Math.max(0, totalStock - qtyInCart);
                                const isSelectionValid = !hasSizeStock || (selectedSize && remaining > 0);

                                return product.isSoldOut || (totalStock <= 0) ? (
                                    <div className="text-red-600 font-bold text-xl mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                                        Currently Sold Out
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => {
                                                if (hasSizeStock && !selectedSize) { showToast('Please select a size first', 'info'); return; }
                                                addToCart({ ...product, selectedSize: hasSizeStock ? selectedSize : null });
                                                showToast(`${product.name} added to cart!`, 'success');
                                            }}
                                            disabled={!isSelectionValid || remaining <= 0}
                                            className="w-full bg-vastra-gold hover:bg-yellow-500 text-gray-900 font-medium py-3 rounded-full shadow-sm transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <ShoppingBag className="h-5 w-5 mr-2" />
                                            {remaining <= 0 ? 'Limit Reached' : 'Add to Cart'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (hasSizeStock && !selectedSize) { showToast('Please select a size first', 'info'); return; }
                                                addToCart({ ...product, selectedSize: hasSizeStock ? selectedSize : null });
                                                navigate('/cart');
                                            }}
                                            disabled={!isSelectionValid || remaining <= 0}
                                            className="w-full bg-vastra-teal hover:bg-teal-700 text-white font-medium py-3 rounded-full shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Buy Now
                                        </button>
                                    </>
                                );
                            })()}
                        </div>

                        {/* Promise Badges */}
                        <div className="grid grid-cols-2 gap-4 mt-8 py-6 border-t border-b border-gray-100">
                            <div className="flex items-start space-x-3">
                                <div className="bg-vastra-bg p-2 rounded-lg">
                                    <ShieldCheck className="h-5 w-5 text-vastra-teal" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Verified Handloom</p>
                                    <p className="text-[10px] text-gray-500">Authentic Weaver Product</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-vastra-bg p-2 rounded-lg">
                                    <Truck className="h-5 w-5 text-vastra-teal" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Global Shipping</p>
                                    <p className="text-[10px] text-gray-500">Delivered in 5-7 days</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-vastra-bg p-2 rounded-lg">
                                    <RefreshCcw className="h-5 w-5 text-vastra-teal" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Easy Returns</p>
                                    <p className="text-[10px] text-gray-500">7-day return policy</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-3">
                                <div className="bg-vastra-bg p-2 rounded-lg">
                                    <Star className="h-5 w-5 text-vastra-teal" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Premium Quality</p>
                                    <p className="text-[10px] text-gray-500">100% Quality Assurance</p>
                                </div>
                            </div>
                        </div>

                        {/* Specs Table */}
                        <div className="mt-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">
                                <GradientText text="Product Details" />
                            </h3>
                            <table className="w-full text-sm text-left">
                                <tbody>
                                    {product.material && (
                                        <tr className="border-t border-gray-200"><th className="py-2 text-gray-500 bg-vastra-card/40 px-4 w-1/3">Material</th><td className="py-2 px-4">{product.material}</td></tr>
                                    )}
                                    {product.pattern && (
                                        <tr className="border-t border-gray-200"><th className="py-2 text-gray-500 bg-vastra-card/40 px-4">Pattern</th><td className="py-2 px-4">{product.pattern}</td></tr>
                                    )}
                                    {product.occasion && (
                                        <tr className="border-t border-gray-200"><th className="py-2 text-gray-500 bg-vastra-card/40 px-4">Occasion</th><td className="py-2 px-4">{product.occasion}</td></tr>
                                    )}
                                    {product.weavingRegion && (
                                        <tr className="border-t border-gray-200"><th className="py-2 text-gray-500 bg-vastra-card/40 px-4">Weaving Region</th><td className="py-2 px-4">{product.weavingRegion}</td></tr>
                                    )}
                                    {product.fabricCare && (
                                        <tr className="border-t border-gray-200"><th className="py-2 text-gray-500 bg-vastra-card/40 px-4">Fabric Care</th><td className="py-2 px-4">{product.fabricCare}</td></tr>
                                    )}
                                    <tr className="border-t border-b border-gray-200"><th className="py-2 text-gray-500 bg-vastra-card/40 px-4">Country of Origin</th><td className="py-2 px-4">{product.countryOfOrigin || 'India'}</td></tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Size Guide Modal */}
                        {isSizeGuideOpen && (
                            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                                <div className="bg-white rounded-2xl max-w-lg w-full p-8 relative shadow-2xl">
                                    <button
                                        onClick={() => setIsSizeGuideOpen(false)}
                                        className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X className="h-6 w-6 text-gray-500" />
                                    </button>
                                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center">
                                        <Ruler className="h-6 w-6 mr-3 text-vastra-teal" /> <GradientText text="Size Chart" />
                                    </h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-center">
                                            <thead>
                                                <tr className="bg-vastra-bg">
                                                    <th className="py-3 px-4 rounded-tl-lg font-bold">Size</th>
                                                    <th className="py-3 px-4 font-bold">Bust (in)</th>
                                                    <th className="py-3 px-4 font-bold">Waist (in)</th>
                                                    <th className="py-3 px-4 rounded-tr-lg font-bold">Length (in)</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                <tr><td className="py-3 font-medium">S</td><td>34</td><td>28</td><td>42</td></tr>
                                                <tr><td className="py-3 font-medium">M</td><td>36</td><td>30</td><td>42</td></tr>
                                                <tr><td className="py-3 font-medium">L</td><td>38</td><td>32</td><td>43</td></tr>
                                                <tr><td className="py-3 font-medium">XL</td><td>40</td><td>34</td><td>43</td></tr>
                                                <tr><td className="py-3 font-medium">XXL</td><td>42</td><td>36</td><td>44</td></tr>
                                                <tr><td className="py-3 font-medium">Saree</td><td colSpan="3" className="italic text-gray-500">Standard 5.5 - 6 Meters</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="mt-6 text-xs text-gray-500 leading-relaxed">
                                        * measurements are for the garment. For a comfortable fit, choose a size that is 1-2 inches larger than your body measurements.
                                    </p>
                                </div>
                            </div>
                        )}

                        <div className="mt-12 border-t border-gray-200 pt-8">
                            <h3 className="text-xl font-serif font-bold text-gray-900 mb-6">
                                <GradientText text="Customer Reviews" />
                            </h3>

                            {/* Review Form */}
                            <div className="bg-vastra-card/60 p-6 rounded-lg mb-8">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Write a Review</h4>
                                {user ? (
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        try {
                                            const res = await axios.post(`${API_URL}/api/products/${product._id}/reviews`, {
                                                user: user.fullName,
                                                rating: reviewForm.rating,
                                                comment: reviewForm.comment,
                                                image: reviewForm.image
                                            });
                                            setReviews(res.data);
                                            setReviewForm({ rating: 5, comment: '', image: '' });
                                            showToast('Review submitted! Thank you.', 'success');
                                        } catch (err) {
                                            console.error(err);
                                            showToast('Failed to submit review. Please try again.', 'error');
                                        }
                                    }}>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                                                <div className="flex space-x-2">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <button
                                                            key={star}
                                                            type="button"
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                                            className={`focus:outline-none transition-transform hover:scale-110 ${star <= reviewForm.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                                        >
                                                            <Star className={`h-6 w-6 ${star <= reviewForm.rating ? 'fill-current' : ''}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Add Photo (Optional)</label>
                                                <div className="flex items-center space-x-4">
                                                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-lg shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 flex items-center">
                                                        <Camera className="h-4 w-4 mr-2" />
                                                        {isReviewPhotoUploading ? 'Uploading...' : 'Upload Image'}
                                                        <input
                                                            type="file"
                                                            className="sr-only"
                                                            accept="image/*"
                                                            onChange={async (e) => {
                                                                const file = e.target.files[0];
                                                                if (!file) return;

                                                                const formData = new FormData();
                                                                formData.append('image', file);

                                                                setIsReviewPhotoUploading(true);
                                                                try {
                                                                    const res = await axios.post(`${API_URL}/api/upload`, formData);
                                                                    setReviewForm({ ...reviewForm, image: res.data.url });
                                                                } catch (err) {
                                                                    console.error(err);
                                                                    alert('Failed to upload image');
                                                                } finally {
                                                                    setIsReviewPhotoUploading(false);
                                                                }
                                                            }}
                                                        />
                                                    </label>
                                                    {reviewForm.image && (
                                                        <div className="relative">
                                                            <img src={reviewForm.image} alt="Preview" className="h-10 w-10 object-cover rounded-md border border-gray-200" />
                                                            <button
                                                                type="button"
                                                                onClick={() => setReviewForm({ ...reviewForm, image: '' })}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                            <textarea
                                                value={reviewForm.comment}
                                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                required
                                                rows="3"
                                                className="w-full border border-gray-300 rounded-md shadow-sm p-4 focus:ring-vastra-teal focus:border-vastra-teal bg-white"
                                                placeholder="Share your thoughts about this product..."
                                            ></textarea>
                                        </div>
                                        <button type="submit" className="bg-vastra-teal text-white px-4 py-2 rounded-md hover:bg-teal-700 transition-colors">
                                            Submit Review
                                        </button>
                                    </form>
                                ) : (
                                    <p className="text-gray-600">Please <span onClick={() => navigate('/login')} className="text-vastra-teal cursor-pointer hover:underline">login</span> to write a review.</p>
                                )}
                            </div>

                            {/* Reviews List */}
                            <div className="space-y-6">
                                {reviews.length > 0 ? (
                                    reviews.map((review, index) => (
                                        <div key={index} className="border-b border-gray-100 pb-6 last:border-0">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                                                    {review.user ? review.user.charAt(0).toUpperCase() : 'A'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{review.user || 'Anonymous'}</p>
                                                    <div className="flex text-yellow-500">
                                                        {[...Array(5)].map((_, i) => (
                                                            <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                        ))}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-gray-500 ml-auto">{new Date(review.date).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 text-sm mt-2">{review.comment}</p>
                                            {review.image && (
                                                <div className="mt-3">
                                                    <img
                                                        src={review.image}
                                                        alt="User review"
                                                        className="h-24 w-24 object-cover rounded-lg border border-gray-100 cursor-pointer hover:opacity-90 transition-opacity"
                                                        onClick={() => window.open(review.image, '_blank')}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">No reviews yet. Be the first to review!</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
