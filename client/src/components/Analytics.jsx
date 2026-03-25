import React, { useEffect, useState } from 'react';
import { TrendingUp, ShoppingBag, Users, Package } from 'lucide-react';
import { API_URL } from '../config';

const Analytics = () => {
    const [orders, setOrders] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            fetch(`${API_URL}/api/orders`).then(r => r.json()).catch(() => []),
            fetch(`${API_URL}/api/products`).then(r => r.json()).catch(() => []),
        ]).then(([o, p]) => {
            setOrders(Array.isArray(o) ? o : []);
            setProducts(Array.isArray(p) ? p : []);
            setLoading(false);
        });
    }, []);

    const totalRevenue = orders.reduce((s, o) => s + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;
    const delivered = orders.filter(o => o.status === 'Delivered').length;
    const lowStock = products.filter(p => (p.stock || 0) < 5);

    // Last 7 days revenue
    const last7 = [...Array(7)].map((_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const day = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const rev = orders.filter(o => {
            const od = new Date(o.createdAt);
            return od.toDateString() === d.toDateString();
        }).reduce((s, o) => s + (o.totalAmount || 0), 0);
        return { day, rev };
    });

    const maxRev = Math.max(...last7.map(d => d.rev), 1);

    // Top 5 selling products
    const productSales = {};
    orders.forEach(o => (o.items || []).forEach(item => {
        productSales[item.name] = (productSales[item.name] || 0) + (item.qty || 1);
    }));
    const topProducts = Object.entries(productSales).sort((a, b) => b[1] - a[1]).slice(0, 5);

    if (loading) return <div className="text-center py-8 text-gray-400">Loading analytics...</div>;

    return (
        <div className="space-y-6">
            {/* Stat Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: TrendingUp, color: '#065f46' },
                    { label: 'Total Orders', value: totalOrders, icon: ShoppingBag, color: '#0d9488' },
                    { label: 'Delivered', value: delivered, icon: Package, color: '#C9960C' },
                    { label: 'Total Products', value: products.length, icon: Users, color: '#7c3aed' },
                ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl p-5 border border-gray-100" style={{ background: `${stat.color}10` }}>
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                            <stat.icon className="h-5 w-5" style={{ color: stat.color }} />
                        </div>
                        <p className="text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Revenue Chart (last 7 days) */}
            <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Revenue — Last 7 Days</h3>
                <div className="flex items-end gap-2 h-40">
                    {last7.map((d) => (
                        <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[10px] text-gray-500">₹{d.rev > 0 ? (d.rev / 1000).toFixed(1) + 'k' : '0'}</span>
                            <div className="w-full rounded-t-lg transition-all" style={{
                                height: `${(d.rev / maxRev) * 120}px`,
                                minHeight: d.rev > 0 ? '8px' : '3px',
                                background: d.rev > 0 ? 'linear-gradient(180deg, #0d9488, #065f46)' : '#e5e7eb'
                            }} />
                            <span className="text-[10px] text-gray-400">{d.day}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Products */}
            <div className="rounded-2xl border border-gray-100 p-6 bg-white">
                <h3 className="text-sm font-bold text-gray-700 mb-4">Top Selling Products</h3>
                {topProducts.length === 0 ? (
                    <p className="text-gray-400 text-sm">No sales data yet.</p>
                ) : (
                    <div className="space-y-3">
                        {topProducts.map(([name, qty], i) => (
                            <div key={name} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-gray-400 w-4">#{i + 1}</span>
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="font-medium text-gray-700 truncate">{name}</span>
                                        <span className="text-teal-600 font-bold ml-2">{qty} sold</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full">
                                        <div className="h-1.5 rounded-full" style={{ width: `${(qty / topProducts[0][1]) * 100}%`, background: 'linear-gradient(90deg, #065f46, #0d9488)' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Low Stock Warning */}
            {lowStock.length > 0 && (
                <div className="rounded-2xl border border-red-200 p-5 bg-red-50">
                    <h3 className="text-sm font-bold text-red-700 mb-3">⚠️ Low Stock Products ({lowStock.length})</h3>
                    <div className="divide-y divide-red-100">
                        {lowStock.map(p => (
                            <div key={p._id} className="flex justify-between py-2 text-sm">
                                <span className="text-gray-700 font-medium truncate">{p.name}</span>
                                <span className="text-red-600 font-bold ml-4">{p.stock || 0} left</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Analytics;
