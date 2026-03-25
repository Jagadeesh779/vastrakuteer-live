import React from 'react';

const GradientText = ({ text, className = "", variant = "default" }) => {
    if (!text) return null;

    const words = text.split(' ');

    let gradientClasses;
    if (variant === "aurora") {
        gradientClasses = "from-[#047857] via-[#0369a1] to-[#1d4ed8]";
    } else if (variant === "elegant") {
        gradientClasses = "from-[#eab308] via-[#f59e0b] to-[#ec4899]"; /* yellow-500 to amber-500 to pink-500 */
    } else {
        gradientClasses = "from-[#065f46] via-[#0d9488] to-[#0891b2]";
    }

    // If only one word, style the whole word
    if (words.length === 1) {
        return (
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientClasses} ${className}`}>
                {text}
            </span>
        );
    }

    // Apply gradient to the second word
    return (
        <span>
            {words[0]}{' '}
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradientClasses} ${className}`}>
                {words[1]}
            </span>
            {words.length > 2 ? ' ' + words.slice(2).join(' ') : ''}
        </span>
    );
};

export default GradientText;
