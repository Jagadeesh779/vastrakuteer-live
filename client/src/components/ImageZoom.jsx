import React, { useState, useRef } from 'react';

const ZOOM_SCALE = 1.85; // How much to zoom in — adjust as needed

const ImageZoom = ({ src, alt }) => {
    const [transformOrigin, setTransformOrigin] = useState('50% 50%');
    const [isHovered, setIsHovered] = useState(false);
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
            className="relative overflow-hidden rounded-2xl bg-gray-100 cursor-zoom-in group aspect-[4/5]"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            ref={imgRef}
        >
            <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover"
                style={{
                    transform: isHovered ? `scale(${ZOOM_SCALE})` : 'scale(1)',
                    transformOrigin: transformOrigin,
                    transition: isHovered
                        ? 'transform 0.15s ease-out'
                        : 'transform 0.3s ease-out',
                    willChange: 'transform',
                }}
            />

            {/* Zoom hint */}
            {!isHovered && (
                <div className="absolute bottom-4 right-4 bg-black/30 backdrop-blur-md text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    Roll over to zoom
                </div>
            )}
        </div>
    );
};

export default ImageZoom;
