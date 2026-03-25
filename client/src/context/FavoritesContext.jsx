import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const FavoritesContext = createContext();

export const useFavorites = () => useContext(FavoritesContext);

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);

    // Safely parse user from local storage
    const getUserFromStorage = () => {
        try {
            const storedUser = localStorage.getItem('user');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (error) {
            console.error("Error parsing user from local storage:", error);
            return null;
        }
    };

    const location = useLocation();
    const [user, setUser] = useState(getUserFromStorage());

    // Update user state whenever the location changes (e.g., after login)
    useEffect(() => {
        const currentUser = getUserFromStorage();
        setUser(currentUser);
    }, [location.pathname]);

    // Load favorites from backend on mount or user change
    useEffect(() => {
        if (user && user.email) {
            fetchFavorites(user); // Pass the current user object
        } else {
            setFavorites([]);
        }
    }, [user?.email]);

    const fetchFavorites = async (currentUser) => {
        const activeUser = currentUser || user;
        if (!activeUser || !activeUser.email) return;

        try {
            const response = await fetch('http://localhost:5000/api/user/get-favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: activeUser.email }),
            });
            if (response.ok) {
                const data = await response.json();
                setFavorites(data);
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
        }
    };

    const addToFavorites = async (product) => {
        if (!user) {
            alert('Please login to add to favorites');
            return;
        }

        // Optimistic UI update
        if (!favorites.includes(product._id)) {
            setFavorites([...favorites, product._id]);
        }

        try {
            const response = await fetch('http://localhost:5000/api/user/add-favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email, productId: product._id }),
            });

            if (!response.ok) {
                // Revert on failure
                fetchFavorites();
            }
        } catch (error) {
            console.error('Error adding to favorites:', error);
            fetchFavorites();
        }
    };

    const removeFromFavorites = async (productId) => {
        if (!user) return;

        // Optimistic UI
        setFavorites(favorites.filter(id => id !== productId));

        try {
            const response = await fetch('http://localhost:5000/api/user/remove-favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: user.email, productId }),
            });

            if (!response.ok) {
                fetchFavorites();
            }
        } catch (error) {
            console.error('Error removing from favorites:', error);
            fetchFavorites();
        }
    };

    const isFavorite = (productId) => {
        return favorites.includes(productId);
    };

    return (
        <FavoritesContext.Provider value={{ favorites, addToFavorites, removeFromFavorites, isFavorite }}>
            {children}
        </FavoritesContext.Provider>
    );
};
