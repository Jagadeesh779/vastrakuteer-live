import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from local storage on initial render
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('cartItems');
            if (storedCart) {
                setCartItems(JSON.parse(storedCart));
            } else {
                setCartItems([]);
            }
        } catch (error) {
            console.error("Error parsing cart data:", error);
            localStorage.removeItem('cartItems');
            setCartItems([]);
        }
    }, []);

    // Save cart to local storage whenever it changes
    useEffect(() => {
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
    }, [cartItems]);

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item._id === product._id && item.selectedSize === product.selectedSize);
            if (existingItem) {
                return prevItems.map((item) =>
                    item._id === product._id && item.selectedSize === product.selectedSize ? { ...item, quantity: (item.quantity || 1) + 1 } : item
                );
            }
            return [...prevItems, { ...product, quantity: 1 }];
        });
    };

    const removeFromCart = (productId, size) => {
        setCartItems((prevItems) => prevItems.filter((item) => !(item._id === productId && item.selectedSize === size)));
    };

    const updateQuantity = (productId, size, newQuantity) => {
        if (newQuantity < 1) return;
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === productId && item.selectedSize === size ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity }}>
            {children}
        </CartContext.Provider>
    );
};
