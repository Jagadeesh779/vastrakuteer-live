import React from 'react';

// Shared skeleton card used in Shop, Favorites, Collections
export const SkeletonCard = () => (
    <div className="rounded-xl overflow-hidden animate-pulse" style={{ background: 'rgba(245,243,255,0.8)', border: '1px solid rgba(196,181,253,0.3)' }}>
        <div className="aspect-[4/5] bg-purple-100/60" />
        <div className="p-4 space-y-2">
            <div className="h-3 bg-purple-100 rounded w-1/3" />
            <div className="h-4 bg-purple-100 rounded w-2/3" />
            <div className="h-4 bg-purple-100 rounded w-1/2" />
        </div>
    </div>
);

// Skeleton for an order card in MyOrders
export const SkeletonOrderCard = () => (
    <div className="rounded-xl overflow-hidden animate-pulse border border-gray-100 bg-white shadow-sm p-6 space-y-4">
        <div className="flex justify-between items-center">
            <div className="h-5 bg-gray-100 rounded w-28" />
            <div className="h-5 bg-gray-100 rounded w-16" />
        </div>
        <div className="flex gap-4">
            <div className="h-16 w-16 bg-gray-100 rounded-md flex-shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
        </div>
        <div className="h-4 bg-gray-100 rounded w-full" />
        <div className="h-4 bg-gray-100 rounded w-2/3" />
    </div>
);

export default SkeletonCard;
