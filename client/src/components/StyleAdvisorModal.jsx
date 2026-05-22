import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wand2, X, ArrowLeft, ArrowRight, ShoppingBag, Star, Check } from 'lucide-react';
import axios from 'axios';
import { API_URL } from '../config';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const QUESTIONS = [
    {
        id: 'occasion',
        title: 'What is the occasion you are dressing for?',
        options: [
            { value: 'wedding', label: 'Wedding & Festive', icon: '🏰', description: 'Luxurious silks, heavy borders, and grand designer styles' },
            { value: 'casual', label: 'Casual & Daily Wear', icon: '🌸', description: 'Lightweight prints, soft cottons, and relaxed fits' },
            { value: 'office', label: 'Office & Semi-Formal', icon: '💼', description: 'Solid colors, smart cuts, and comfortable materials' },
            { value: 'party', label: 'Parties & Receptions', icon: '🥂', description: 'Glamorous georgettes, flowy chiffons, and modern details' }
        ]
    },
    {
        id: 'fabric',
        title: 'Which fabric feels best on you?',
        options: [
            { value: 'silk', label: 'Luxury Silk', icon: '🧵', description: 'Pure Banarasi, Kanchipuram, or raw silk weaves' },
            { value: 'cotton', label: 'Comfortable Cotton', icon: '👕', description: 'Breathable, handloom, and soft linen cottons' },
            { value: 'georgette', label: 'Flowy Georgette', icon: '🌾', description: 'Light, elegant, drapable georgettes & chiffons' },
            { value: 'blend', label: 'Art Silk & Blends', icon: '✨', description: 'Easy-to-manage, sheen-finished art silk & poly blends' }
        ]
    },
    {
        id: 'color',
        title: 'What color palette fits your mood?',
        options: [
            { value: 'red', label: 'Vibrant Reds & Pinks', icon: '🔴', description: 'Maroon, ruby, magenta, and rose tones' },
            { value: 'green', label: 'Deep Teals & Greens', icon: '🟢', description: 'Emerald, forest green, olive, and teal shades' },
            { value: 'yellow', label: 'Pastels & Yellows', icon: '🟡', description: 'Lemon, mustard, peach, cream, and beige' },
            { value: 'blue', label: 'Royal Blues & Purples', icon: '🔵', description: 'Indigo, sapphire, violet, and deep purple' }
        ]
    },
    {
        id: 'category',
        title: 'What category are you searching for?',
        options: [
            { value: 'saree', label: 'Sarees', icon: '🥻', description: 'Traditional and designer six-yard elegance' },
            { value: 'kurti', label: 'Kurtis & Suits', icon: '👗', description: 'Chic kurtas, set wear, and tunics' },
            { value: 'both', label: 'Show me both', icon: '🛍️', description: 'Explore our complete ethnic wear collection' }
        ]
    }
];

const StyleAdvisorModal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({ occasion: '', fabric: '', color: '', category: '' });
    const [products, setProducts] = useState([]);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedSizes, setSelectedSizes] = useState({}); // productId -> size

    const { addToCart } = useCart();
    const { showToast } = useToast();
    const navigate = useNavigate();

    // Fetch all products
    useEffect(() => {
        const fetchAll = async () => {
            try {
                const res = await axios.get(`${API_URL}/api/products`);
                setProducts(res.data);
            } catch (err) {
                console.error("Error fetching advisor products", err);
            }
        };
        fetchAll();
    }, []);

    const handleSelectOption = (questionId, value) => {
        setAnswers(prev => ({ ...prev, [questionId]: value }));
        if (currentStep < QUESTIONS.length - 1) {
            setTimeout(() => {
                setCurrentStep(prev => prev + 1);
            }, 300);
        } else {
            // Process recommendations
            generateRecommendations();
        }
    };

    const generateRecommendations = () => {
        setLoading(true);
        // Simple client-side matchmaking filter
        setTimeout(() => {
            let matched = products.filter(p => {
                if (p.showOnShop === false) return false;

                // 1. Category Filter
                const categoryStr = (p.category || '').toLowerCase();
                const nameStr = (p.name || '').toLowerCase();
                if (answers.category === 'saree') {
                    if (!categoryStr.includes('saree') && !nameStr.includes('saree')) return false;
                } else if (answers.category === 'kurti') {
                    if (categoryStr.includes('saree') || nameStr.includes('saree')) return false;
                }

                // Match counter to rank recommendations
                let score = 0;

                // 2. Occasion matching keyword check
                const descStr = (p.description || '').toLowerCase();
                const materialsStr = (p.material || '').toLowerCase();
                const occasionStr = (p.occasion || '').toLowerCase();

                if (answers.occasion === 'wedding') {
                    if (descStr.includes('wedding') || descStr.includes('festive') || descStr.includes('banarasi') || descStr.includes('silk') || occasionStr.includes('wedding') || occasionStr.includes('festive')) score += 2;
                } else if (answers.occasion === 'casual') {
                    if (descStr.includes('cotton') || descStr.includes('casual') || descStr.includes('print') || descStr.includes('daily') || occasionStr.includes('casual') || occasionStr.includes('daily')) score += 2;
                } else if (answers.occasion === 'office') {
                    if (descStr.includes('formal') || descStr.includes('office') || descStr.includes('solid') || descStr.includes('cotton') || occasionStr.includes('office') || occasionStr.includes('formal')) score += 2;
                } else if (answers.occasion === 'party') {
                    if (descStr.includes('party') || descStr.includes('georgette') || descStr.includes('designer') || descStr.includes('net') || occasionStr.includes('party')) score += 2;
                }

                // 3. Fabric matching check
                if (answers.fabric === 'silk') {
                    if (materialsStr.includes('silk') || descStr.includes('silk') || nameStr.includes('silk')) score += 3;
                } else if (answers.fabric === 'cotton') {
                    if (materialsStr.includes('cotton') || descStr.includes('cotton') || materialsStr.includes('linen') || nameStr.includes('cotton')) score += 3;
                } else if (answers.fabric === 'georgette') {
                    if (materialsStr.includes('georgette') || descStr.includes('georgette') || materialsStr.includes('chiffon') || nameStr.includes('georgette')) score += 3;
                } else if (answers.fabric === 'blend') {
                    if (materialsStr.includes('art silk') || materialsStr.includes('poly') || descStr.includes('art silk') || descStr.includes('blend')) score += 3;
                }

                // 4. Color matching check
                const colorsMap = {
                    red: ['red', 'pink', 'maroon', 'magenta', 'rose', 'crimson'],
                    green: ['green', 'teal', 'emerald', 'olive', 'mint', 'cyan'],
                    yellow: ['yellow', 'mustard', 'peach', 'cream', 'white', 'beige', 'gold'],
                    blue: ['blue', 'purple', 'violet', 'indigo', 'sapphire', 'lavender']
                };
                const searchColors = colorsMap[answers.color] || [];
                const searchStr = `${nameStr} ${descStr} ${categoryStr}`;
                const matchesColor = searchColors.some(color => searchStr.includes(color));
                if (matchesColor) score += 4;

                p._advisorScore = score;
                return score > 0;
            });

            // Sort by match score desc
            matched.sort((a, b) => b._advisorScore - a._advisorScore);

            // Fallback to top rated products if no exact match found
            if (matched.length === 0) {
                matched = [...products]
                    .filter(p => p.showOnShop !== false)
                    .sort((a, b) => (b.rating || 4) - (a.rating || 4));
            }

            setRecommendations(matched.slice(0, 4));
            setLoading(false);
            setCurrentStep(QUESTIONS.length); // go to recommendations step
        }, 1200);
    };

    const handleRestart = () => {
        setAnswers({ occasion: '', fabric: '', color: '', category: '' });
        setCurrentStep(0);
        setRecommendations([]);
    };

    const handleSizeSelect = (productId, size) => {
        setSelectedSizes(prev => ({ ...prev, [productId]: size }));
    };

    const handleAddToCart = (product) => {
        const availableSizes = product.sizes ? Object.entries(product.sizes).filter(([, qty]) => qty > 0).map(([s]) => s) : [];
        const needsSize = availableSizes.length > 0 && !(availableSizes.length === 1 && availableSizes[0] === 'Saree');
        const selectedSize = selectedSizes[product._id];

        if (needsSize && !selectedSize) {
            showToast('Please select a size first', 'info');
            return;
        }

        addToCart({
            ...product,
            selectedSize: needsSize ? selectedSize : (availableSizes.includes('Saree') ? 'Saree' : null)
        });
        showToast(`${product.name} added to cart!`, 'success');
    };

    return (
        <>
            {/* Launcher Trigger Button */}
            <div className="fixed left-8 bottom-24 z-[99] hidden sm:block">
                <button
                    onClick={() => {
                        setIsOpen(true);
                        handleRestart();
                    }}
                    className="flex items-center space-x-2 bg-gradient-to-r from-vastra-gold to-yellow-500 text-gray-900 font-bold px-4 py-3 rounded-full shadow-[0_8px_20px_rgba(201,150,12,0.3)] hover:shadow-[0_12px_25px_rgba(201,150,12,0.5)] transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:animate-shine pointer-events-none" />
                    <Wand2 className="h-5 w-5 text-gray-900 animate-pulse" />
                    <span className="text-xs tracking-wide">Style Advisor</span>
                </button>
            </div>

            {/* Mobile Launcher */}
            <div className="fixed left-4 bottom-20 z-40 sm:hidden">
                <button
                    onClick={() => {
                        setIsOpen(true);
                        handleRestart();
                    }}
                    className="p-3.5 bg-gradient-to-r from-vastra-gold to-yellow-500 text-gray-900 rounded-full shadow-lg flex items-center justify-center"
                    aria-label="Style Advisor"
                >
                    <Wand2 className="h-5 w-5" />
                </button>
            </div>

            {/* Quiz Modal Container */}
            {isOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-vastra-bg rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col relative shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden border border-vastra-border">
                        {/* Background subtle gradients */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-teal-100/30 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 right-0 w-64 h-64 bg-yellow-100/30 rounded-full blur-3xl pointer-events-none" />

                        {/* Modal Header */}
                        <div className="flex justify-between items-center px-8 py-5 border-b border-vastra-border relative z-10">
                            <div className="flex items-center space-x-2 text-vastra-teal">
                                <Wand2 className="h-5 w-5 text-vastra-gold animate-bounce" />
                                <h3 className="font-serif font-bold text-gray-900 text-lg">Your Personal Style Advisor</h3>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/60 rounded-full text-gray-400 hover:text-gray-900 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="flex-1 overflow-y-auto p-8 relative z-10">
                            {currentStep < QUESTIONS.length ? (
                                // Render Active Question
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-vastra-teal uppercase tracking-widest">
                                            Step {currentStep + 1} of {QUESTIONS.length}
                                        </span>
                                        <div className="flex space-x-1.5">
                                            {QUESTIONS.map((_, idx) => (
                                                <div
                                                    key={idx}
                                                    className={`h-1.5 w-6 rounded-full transition-all duration-300 ${
                                                        idx <= currentStep ? 'bg-vastra-teal' : 'bg-gray-200'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <h4 className="text-xl font-bold text-gray-900 font-serif leading-tight">
                                        {QUESTIONS[currentStep].title}
                                    </h4>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                        {QUESTIONS[currentStep].options.map(option => {
                                            const isSelected = answers[QUESTIONS[currentStep].id] === option.value;
                                            return (
                                                <button
                                                    key={option.value}
                                                    onClick={() => handleSelectOption(QUESTIONS[currentStep].id, option.value)}
                                                    className={`p-5 rounded-2xl border text-left flex items-start space-x-4 transition-all duration-300 transform active:scale-98 ${
                                                        isSelected
                                                            ? 'border-vastra-teal bg-white shadow-[0_8px_20px_rgba(13,148,136,0.15)] scale-[1.01]'
                                                            : 'border-vastra-border bg-white/40 hover:bg-white/95 hover:shadow-md'
                                                    }`}
                                                >
                                                    <span className="text-3xl bg-teal-50/50 p-2.5 rounded-xl block flex-shrink-0">
                                                        {option.icon}
                                                    </span>
                                                    <div>
                                                        <h5 className="font-bold text-sm text-gray-900 flex items-center">
                                                            {option.label}
                                                            {isSelected && <Check className="h-4 w-4 ml-2 text-vastra-teal" />}
                                                        </h5>
                                                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                                            {option.description}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : loading ? (
                                // Loading Recommendations
                                <div className="flex flex-col items-center justify-center py-16 space-y-4">
                                    <div className="relative h-16 w-16">
                                        <div className="absolute inset-0 rounded-full border-4 border-teal-100 border-t-vastra-teal animate-spin" />
                                        <Wand2 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-vastra-gold animate-pulse" />
                                    </div>
                                    <h4 className="font-serif font-bold text-lg text-gray-800">Curating Your Perfect Picks...</h4>
                                    <p className="text-xs text-gray-500">Matching fabrics, color palettes, and occasions.</p>
                                </div>
                            ) : (
                                // Render Recommendations Results
                                <div className="space-y-6">
                                    <div className="text-center pb-2">
                                        <span className="text-3xl">✨🛍️✨</span>
                                        <h4 className="text-2xl font-serif font-bold text-gray-900 mt-2">Recommended For You</h4>
                                        <p className="text-xs text-gray-500 mt-1">Based on your styling preferences, here are our top matching pieces.</p>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {recommendations.map(product => {
                                            const availableSizes = product.sizes
                                                ? Object.entries(product.sizes).filter(([, qty]) => qty > 0).map(([s]) => s)
                                                : [];
                                            const hasSizes = availableSizes.length > 0 && !(availableSizes.length === 1 && availableSizes[0] === 'Saree');
                                            const selectedSize = selectedSizes[product._id] || '';

                                            return (
                                                <div
                                                    key={product._id}
                                                    className="bg-white/80 backdrop-blur-sm p-4 rounded-3xl border border-vastra-border flex flex-col justify-between hover:shadow-lg transition-shadow relative"
                                                >
                                                    <div className="flex space-x-4">
                                                        <img
                                                            src={product.image}
                                                            alt={product.name}
                                                            className="h-24 w-18 object-cover rounded-xl border border-vastra-border flex-shrink-0"
                                                        />
                                                        <div className="overflow-hidden">
                                                            <span className="text-[10px] text-vastra-teal font-bold uppercase tracking-widest">
                                                                {product.brand}
                                                            </span>
                                                            <h5 className="font-bold text-sm text-gray-900 truncate mt-0.5">
                                                                {product.name}
                                                            </h5>
                                                            <p className="text-sm font-bold text-gray-900 mt-1">₹{product.price}</p>

                                                            {/* Rating */}
                                                            <div className="flex items-center space-x-1 text-yellow-500 mt-1.5">
                                                                <Star className="h-3.5 w-3.5 fill-current" />
                                                                <span className="text-xs text-gray-600 font-bold">{product.rating || 4.2}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                                                        {hasSizes ? (
                                                            <select
                                                                value={selectedSize}
                                                                onChange={(e) => handleSizeSelect(product._id, e.target.value)}
                                                                className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-vastra-teal bg-white font-medium text-gray-700"
                                                            >
                                                                <option value="">Size</option>
                                                                {availableSizes.map(s => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        ) : (
                                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                                                Standard Size
                                                            </div>
                                                        )}

                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => {
                                                                    setIsOpen(false);
                                                                    navigate(`/product/${product._id}`);
                                                                }}
                                                                className="px-3 py-1.5 border border-vastra-teal text-vastra-teal font-semibold text-xs rounded-xl hover:bg-teal-50 transition-colors"
                                                            >
                                                                Details
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddToCart(product)}
                                                                className="px-3 py-1.5 bg-vastra-teal text-white font-semibold text-xs rounded-xl hover:bg-teal-700 transition-colors flex items-center space-x-1"
                                                            >
                                                                <ShoppingBag className="h-3.5 w-3.5" />
                                                                <span>Add</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-8 py-5 border-t border-vastra-border bg-gray-50/50 flex justify-between items-center relative z-10">
                            {currentStep > 0 && currentStep < QUESTIONS.length && (
                                <button
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="flex items-center text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
                                </button>
                            )}

                            {currentStep === QUESTIONS.length ? (
                                <button
                                    onClick={handleRestart}
                                    className="px-5 py-2.5 bg-vastra-teal text-white font-bold text-xs rounded-full shadow hover:bg-teal-700 transition-all ml-auto"
                                >
                                    Take Quiz Again
                                </button>
                            ) : (
                                <span className="text-[10px] text-gray-400 font-medium ml-auto">
                                    Vastra Kuteer Style Advisor v1.0
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Shine Animation keyframe */}
            <style>{`
                @keyframes shine {
                    100% {
                        transform: skewX(-12deg) translateX(100%);
                    }
                }
                .group:hover .group-hover\\:animate-shine {
                    animation: shine 0.75s ease-in-out;
                }
            `}</style>
        </>
    );
};

export default StyleAdvisorModal;
