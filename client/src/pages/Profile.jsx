import React, { useState, useEffect } from 'react';
import { User, MapPin, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import GradientText from '../components/GradientText';
import axios from 'axios';
import { API_URL } from '../config';

const Profile = () => {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [addresses, setAddresses] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState({ street: '', city: '', state: '', zip: '', phone: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/user/get-addresses`, { email: user.email });
            setAddresses(res.data);
        } catch (err) {
            console.error('Error fetching addresses', err);
        }
    };

    const handleAddAddress = async (e) => {
        e.preventDefault();
        setError('');
        if (addresses.length >= 5) {
            setError('You can only add up to 5 addresses.');
            return;
        }

        try {
            const res = await axios.post(`${API_URL}/api/user/address`, {
                email: user.email,
                address: newAddress
            });
            setAddresses(res.data);
            setShowAddForm(false);
            setNewAddress({ street: '', city: '', state: '', zip: '', phone: '' });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add address');
        }
    };

    const handleDeleteAddress = async (id) => {
        try {
            const res = await axios.post(`${API_URL}/api/user/delete-address`, {
                email: user.email,
                addressId: id
            });
            setAddresses(res.data);
        } catch (err) {
            console.error('Failed to delete address', err);
        }
    };

    return (
        <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)' }}>
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="bg-vastra-card rounded-2xl shadow-sm p-8 flex items-center space-x-6 border-l-4 border-vastra-pink">
                    <div className="bg-pink-50 p-4 rounded-full">
                        <User className="h-10 w-10 text-vastra-pink" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-gray-900">{user.fullName}</h1>
                        <p className="text-gray-500">{user.email}</p>
                        <span className="inline-block mt-2 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full uppercase tracking-wide">
                            {user.role} Account
                        </span>
                    </div>
                </div>

                {/* Addresses Section */}
                <div className="bg-vastra-card rounded-2xl shadow-sm p-8 border border-vastra-border">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center">
                            <MapPin className="h-5 w-5 mr-2 text-vastra-teal" />
                            <GradientText text="Delivery Addresses" />
                            <span className="ml-3 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{addresses.length}/5 Used</span>
                        </h2>
                        {addresses.length < 5 && !showAddForm && (
                            <button
                                onClick={() => setShowAddForm(true)}
                                className="flex items-center text-sm font-medium text-vastra-pink hover:text-pink-700 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-1" /> Add New Address
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}

                    {showAddForm && (
                        <div className="mb-8 bg-vastra-card/60 p-6 rounded-xl border border-vastra-border">
                            <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                                <GradientText text="Add New Address" />
                            </h3>
                            <form onSubmit={handleAddAddress} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <input
                                        type="text"
                                        placeholder="Street Address"
                                        required
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                        value={newAddress.street}
                                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="City"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.city}
                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="State"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.state}
                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="ZIP Code"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.zip}
                                    onChange={(e) => setNewAddress({ ...newAddress, zip: e.target.value })}
                                />
                                <input
                                    type="text"
                                    placeholder="Phone Number"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-vastra-teal focus:border-vastra-teal"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                />
                                <div className="md:col-span-2 flex justify-end space-x-3 mt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddForm(false)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-vastra-teal text-white rounded-lg hover:bg-teal-700 shadow-md transition-all"
                                    >
                                        Save Address
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="border border-vastra-border rounded-xl p-5 hover:border-vastra-teal transition-colors relative group bg-vastra-bg">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDeleteAddress(addr.id)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                        title="Delete Address"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="flex items-start space-x-3">
                                    <div className="bg-vastra-card p-2 rounded-lg">
                                        <MapPin className="h-5 w-5 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">{addr.city}, {addr.state}</p>
                                        <p className="text-gray-600 text-sm mt-1">{addr.street}</p>
                                        <p className="text-gray-500 text-xs mt-2 font-mono">ZIP: {addr.zip}</p>
                                        <p className="text-gray-500 text-xs mt-1">Ph: {addr.phone}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {addresses.length === 0 && !showAddForm && (
                            <div className="col-span-1 md:col-span-2 text-center py-10 bg-vastra-card/40 rounded-xl border border-dashed border-vastra-border">
                                <MapPin className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No addresses saved yet.</p>
                                <button onClick={() => setShowAddForm(true)} className="text-vastra-pink font-medium hover:underline mt-2">Add your first address</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <Link to="/home" className="inline-flex items-center text-gray-500 hover:text-gray-900 font-medium transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
                    </Link>
                </div>

            </div>
        </div>
    );
};

export default Profile;
