import React, { useState, useRef } from 'react';

const ZOOM_SCALE = 1.85; // How much to zoom in — adjust as needed

const ImageZoom = ({ src, alt }) => {
    const [transformOrigin, setTransformOrigin] = useState('50% 50%');
    const [isZoomed, setIsZoomed] = useState(false);
    const imgRef = useRef(null);

    const handleMouseMove = (e) => {
        if (!imgRef.current) return;
        const { left, top, width, height } = imgRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setTransformOrigin(`${x}% ${y}%`);
    };

    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-gray-100 group aspect-[4/5] ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            onClick={() => setIsZoomed(!isZoomed)}
            onMouseLeave={() => setIsZoomed(false)}
            onMouseMove={handleMouseMove}
            ref={imgRef}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                style={{
                    transform: isZoomed ? `scale(${ZOOM_SCALE})` : 'scale(1)',
                    transformOrigin: transformOrigin,
                    transition: isZoomed
                        ? 'transform 0.15s ease-out'
                        : 'transform 0.3s ease-out',
                    willChange: 'transform',
                }}
            />

            {/* Zoom hint */}
            {!isZoomed && (
                <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Click to zoom
                </div>
            )}
        </div>
    );
};

export default ImageZoom;
