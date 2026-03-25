import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const pages = [];
    const delta = 1;

    for (let i = 1; i <= totalPages; i++) {
        if (
            i === 1 ||
            i === totalPages ||
            (i >= currentPage - delta && i <= currentPage + delta)
        ) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return (
        <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-violet-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-100 text-gray-700"
                style={{ background: 'rgba(245,243,255,0.9)' }}
            >
                <ChevronLeft className="h-4 w-4" /> Prev
            </button>

            {pages.map((page, i) =>
                page === '...' ? (
                    <span key={`ellipsis-${i}`} className="px-2 py-2 text-gray-400 text-sm select-none">…</span>
                ) : (
                    <button
                        key={page}
                        onClick={() => onPageChange(page)}
                        className="w-9 h-9 rounded-xl text-sm font-semibold border transition-all"
                        style={{
                            background: currentPage === page
                                ? 'linear-gradient(135deg, #7c3aed, #0d9488)'
                                : 'rgba(245,243,255,0.9)',
                            color: currentPage === page ? '#fff' : '#374151',
                            border: currentPage === page ? 'none' : '1px solid #ddd6fe',
                            boxShadow: currentPage === page ? '0 2px 8px rgba(124,58,237,0.25)' : 'none',
                        }}
                    >
                        {page}
                    </button>
                )
            )}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-medium border border-violet-200 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-violet-100 text-gray-700"
                style={{ background: 'rgba(245,243,255,0.9)' }}
            >
                Next <ChevronRight className="h-4 w-4" />
            </button>
        </div>
    );
};

export default Pagination;
