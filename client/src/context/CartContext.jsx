import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

const getAvailableStock = (product) => {
    if (!product) return 0;
    if (product.selectedSize && product.sizes && product.sizes[product.selectedSize] !== undefined) {
        return Math.max(0, Number(product.sizes[product.selectedSize]) || 0);
    }
    if (product.count !== undefined && product.count !== null) {
        return Math.max(0, Number(product.count) || 0);
    }
    return 99; // Default fallback if stock is unconstrained
};

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);

    // Load cart from local storage on initial render & clamp quantities to available stock
    useEffect(() => {
        try {
            const storedCart = localStorage.getItem('cartItems');
            if (storedCart) {
                const parsed = JSON.parse(storedCart);
                const clamped = parsed.map(item => {
                    const maxStock = getAvailableStock(item);
                    if (maxStock <= 0) return null; // Remove out of stock items
                    return { ...item, quantity: Math.min(item.quantity || 1, maxStock) };
                }).filter(Boolean);
                setCartItems(clamped);
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

    const addToCart = (product, requestedQty = 1) => {
        const maxStock = getAvailableStock(product);
        if (maxStock <= 0) {
            alert('Sorry, this product is currently out of stock!');
            return false;
        }

        let reachedLimit = false;

        setCartItems((prevItems) => {
            const existingItem = prevItems.find(
                (item) => item._id === product._id && item.selectedSize === product.selectedSize
            );

            if (existingItem) {
                const currentQty = existingItem.quantity || 1;
                const targetQty = currentQty + requestedQty;

                if (targetQty > maxStock) {
                    reachedLimit = true;
                    return prevItems.map((item) =>
                        item._id === product._id && item.selectedSize === product.selectedSize
                            ? { ...item, quantity: maxStock }
                            : item
                    );
                }

                return prevItems.map((item) =>
                    item._id === product._id && item.selectedSize === product.selectedSize
                        ? { ...item, quantity: targetQty }
                        : item
                );
            }

            const qtyToAdd = Math.min(requestedQty, maxStock);
            if (qtyToAdd < requestedQty) {
                reachedLimit = true;
            }
            return [...prevItems, { ...product, quantity: qtyToAdd }];
        });

        if (reachedLimit) {
            alert(`Only ${maxStock} unit(s) available in stock for this item!`);
            return false;
        }
        return true;
    };

    const removeFromCart = (productId, size) => {
        setCartItems((prevItems) => prevItems.filter((item) => !(item._id === productId && item.selectedSize === size)));
    };

    const updateQuantity = (productId, size, newQuantity) => {
        if (newQuantity < 1) return;

        setCartItems((prevItems) =>
            prevItems.map((item) => {
                if (item._id === productId && item.selectedSize === size) {
                    const maxStock = getAvailableStock(item);
                    if (newQuantity > maxStock) {
                        alert(`Only ${maxStock} unit(s) available in stock!`);
                        return { ...item, quantity: maxStock };
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart, updateQuantity, getAvailableStock }}>
            {children}
        </CartContext.Provider>
    );
};
