import React, { useState, useEffect } from 'react';

const FlashSaleTimer = ({ endTime }) => {
    const calcTime = () => {
        const diff = Math.max(0, new Date(endTime) - new Date());
        return {
            h: Math.floor(diff / 3600000),
            m: Math.floor((diff % 3600000) / 60000),
            s: Math.floor((diff % 60000) / 1000),
            done: diff === 0
        };
    };

    const [time, setTime] = useState(calcTime());

    useEffect(() => {
        const interval = setInterval(() => setTime(calcTime()), 1000);
        return () => clearInterval(interval);
    }, [endTime]);

    if (time.done) return null;

    const pad = (n) => String(n).padStart(2, '0');

    return (
        <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wide">Ends in</span>
            {[pad(time.h), pad(time.m), pad(time.s)].map((val, i) => (
                <React.Fragment key={i}>
                    <span className="bg-red-500 text-white font-mono font-bold text-xs px-1.5 py-0.5 rounded">{val}</span>
                    {i < 2 && <span className="text-red-500 font-bold text-xs">:</span>}
                </React.Fragment>
            ))}
        </div>
    );
};

export default FlashSaleTimer;
