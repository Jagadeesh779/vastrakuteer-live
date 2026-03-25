import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, X, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPreview = ({ onClose }) => {
    const { cartItems, removeFromCart, updateQuantity } = useCart();
    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl shadow-2xl z-[150] overflow-hidden border border-violet-100"
            style={{ background: 'rgba(250,249,255,0.98)', backdropFilter: 'blur(12px)' }}>
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-bold text-gray-900 font-serif text-sm">Your Cart ({cartItems.length})</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-4 w-4" /></button>
            </div>

            {cartItems.length === 0 ? (
                <div className="p-6 text-center">
                    <ShoppingBag className="h-10 w-10 text-gray-200 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Your cart is empty</p>
                </div>
            ) : (
                <>
                    <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                        {cartItems.map((item) => (
                            <div key={`${item._id}-${item.selectedSize}`} className="flex gap-3 p-3 hover:bg-violet-50/50 transition-colors">
                                <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                                    <p className="text-[10px] text-gray-500">{item.selectedSize && `Size: ${item.selectedSize} ·`} ₹{item.price}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <button onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity - 1)} disabled={item.quantity <= 1} className="p-0.5 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-40"><Minus className="h-3 w-3" /></button>
                                        <span className="text-xs font-bold">{item.quantity}</span>
                                        <button onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity + 1)} className="p-0.5 rounded bg-gray-100 hover:bg-gray-200"><Plus className="h-3 w-3" /></button>
                                    </div>
                                </div>
                                <button onClick={() => removeFromCart(item._id, item.selectedSize)} className="text-red-300 hover:text-red-500 self-start mt-1"><X className="h-3.5 w-3.5" /></button>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 border-t border-gray-100">
                        <div className="flex justify-between text-sm font-bold text-gray-900 mb-2.5">
                            <span>Total</span><span>₹{total}</span>
                        </div>
                        <Link to="/cart" onClick={onClose} className="block w-full py-2.5 text-center text-white text-sm font-bold rounded-xl transition-all hover:opacity-90" style={{ background: 'linear-gradient(135deg, #0d9488, #065f46)' }}>
                            View Cart & Checkout →
                        </Link>
                    </div>
                </>
            )}
        </div>
    );
};

export default CartPreview;
