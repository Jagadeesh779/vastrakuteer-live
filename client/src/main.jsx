import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import axios from 'axios';

// axios.defaults.withCredentials = true; // Removed for stateless JWT

// Add a request interceptor
axios.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['x-auth-token'] = token;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

import { GoogleOAuthProvider } from '@react-oauth/google';

const GOOGLE_CLIENT_ID = "943636447257-pbnmejpnf6c5c02h1hfugmkq33lnq05b.apps.googleusercontent.com"; // Replace with actual Client ID

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <App />
        </GoogleOAuthProvider>
    </React.StrictMode>,
)
