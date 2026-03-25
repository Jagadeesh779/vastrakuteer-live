import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';

const SearchAutocomplete = ({ inputValue, onClose }) => {
    const [suggestions, setSuggestions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!inputValue || inputValue.length < 2) { setSuggestions([]); return; }
        const fetchSuggestions = async () => {
            try {
                const res = await fetch(`${API_URL}/api/products`);
                const products = await res.json();
                const q = inputValue.toLowerCase();
                const matched = products
                    .filter(p => p.name?.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q))
                    .slice(0, 6);
                setSuggestions(matched);
            } catch (e) { setSuggestions([]); }
        };
        const debounce = setTimeout(fetchSuggestions, 250);
        return () => clearTimeout(debounce);
    }, [inputValue]);

    if (!suggestions.length) return null;

    return (
        <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl shadow-2xl z-[200] overflow-hidden border border-violet-100"
            style={{ background: 'rgba(250,249,255,0.98)', backdropFilter: 'blur(12px)' }}>
            {suggestions.map((p) => (
                <div
                    key={p._id}
                    onClick={() => { navigate(`/product/${p._id}`); onClose(); }}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                >
                    <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 truncate">{p.brand} · ₹{p.price}</p>
                    </div>
                    <span className="text-xs text-violet-400 flex-shrink-0">{p.category}</span>
                </div>
            ))}
            <div className="px-4 py-2 text-center text-xs text-violet-500 cursor-pointer hover:text-violet-700 font-medium"
                onClick={() => { navigate(`/shop?search=${encodeURIComponent(inputValue)}`); onClose(); }}>
                See all results for "{inputValue}" →
            </div>
        </div>
    );
};

export default SearchAutocomplete;
