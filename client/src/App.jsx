import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Shop from './pages/Shop';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import About from './pages/About';
import Profile from './pages/Profile';
import Collections from './pages/Collections';
import ProductDetails from './pages/ProductDetails';
import Favorites from './pages/Favorites';
import OrderTracking from './pages/OrderTracking';
import MyOrders from './pages/MyOrders';
import ReferFriend from './pages/ReferFriend';
import ReturnPolicy from './pages/ReturnPolicy';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import ShippingPolicy from './pages/ShippingPolicy';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import Contact from './pages/Contact';
import ProtectedRoute from './components/ProtectedRoute';
import WhatsAppButton from './components/WhatsAppButton';
import BackToTop from './components/BackToTop';
import MobileNav from './components/MobileNav';
import VisitorPopup from './components/VisitorPopup';
import { FavoritesProvider } from './context/FavoritesContext';
import { CartProvider } from './context/CartContext';
import { ToastProvider } from './context/ToastContext';

// Lazy-load the heavy AdminDashboard (138KB) to keep initial bundle small
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));


// Hide Navbar + Footer on these routes so aurora fills the full screen
const AUTH_ROUTES = ['/', '/login', '/register', '/forgot-password', '/reset-password'];
const STATIC_PAGES = ['/about', '/return-policy', '/privacy', '/terms', '/shipping-policy', '/faq', '/blog', '/contact'];

function Layout() {
    const location = useLocation();

    // Check if current path matches an auth route exactly, or starts with /reset-password
    const isAuthPage = AUTH_ROUTES.includes(location.pathname) || location.pathname.startsWith('/reset-password');

    return (
        <div className="flex flex-col min-h-screen">
            {!isAuthPage && <Navbar />}
            <main className={isAuthPage ? '' : 'flex-grow'}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />
                    <Route path="/reset-password/:token" element={<ResetPassword />} />

                    <Route path="/home" element={
                        <ProtectedRoute roles={['user', 'admin']}><Home /></ProtectedRoute>
                    } />
                    <Route path="/shop" element={
                        <ProtectedRoute roles={['user', 'admin']}><Shop /></ProtectedRoute>
                    } />
                    <Route path="/collections" element={
                        <ProtectedRoute roles={['user', 'admin']}><Collections /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['admin']}>
                            <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-vastra-teal"></div></div>}>
                                <AdminDashboard />
                            </Suspense>
                        </ProtectedRoute>
                    } />
                    <Route path="/cart" element={
                        <ProtectedRoute roles={['user', 'admin']}><Cart /></ProtectedRoute>
                    } />
                    <Route path="/product/:id" element={
                        <ProtectedRoute roles={['user', 'admin']}><ProductDetails /></ProtectedRoute>
                    } />
                    <Route path="/about" element={
                        <ProtectedRoute roles={['user', 'admin']}><About /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute roles={['user', 'admin']}><Profile /></ProtectedRoute>
                    } />
                    <Route path="/favorites" element={
                        <ProtectedRoute roles={['user', 'admin']}><Favorites /></ProtectedRoute>
                    } />
                    <Route path="/order-tracking" element={
                        <ProtectedRoute roles={['user', 'admin']}><OrderTracking /></ProtectedRoute>
                    } />
                    <Route path="/my-orders" element={
                        <ProtectedRoute roles={['user', 'admin']}><MyOrders /></ProtectedRoute>
                    } />
                    <Route path="/refer" element={
                        <ProtectedRoute roles={['user', 'admin']}><ReferFriend /></ProtectedRoute>
                    } />
                    <Route path="/return-policy" element={<ReturnPolicy />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/shipping-policy" element={<ShippingPolicy />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/contact" element={<Contact />} />
                </Routes>
            </main>
            {!isAuthPage && <WhatsAppButton />}
            {!isAuthPage && <BackToTop />}
            {!isAuthPage && <MobileNav />}
            {!isAuthPage && <VisitorPopup />}
            {!isAuthPage && <Footer />}
        </div>
    );
}

function App() {
    return (
        <Router>
            <ToastProvider>
                <CartProvider>
                    <FavoritesProvider>
                        <Layout />
                    </FavoritesProvider>
                </CartProvider>
            </ToastProvider>
        </Router>
    );
}

export default App;
