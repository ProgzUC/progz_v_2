import React, { useState } from 'react';

/**
 * Image component with fallback to colored placeholder
 * Shows a gradient background with course initial if image fails to load
 */
const ImageWithFallback = ({ src, alt, className, fallbackText }) => {
    const [imageError, setImageError] = useState(false);

    // Generate a color based on the fallback text
    const getGradientColor = (text) => {
        if (!text) return ['#008952', '#004d40'];

        const colors = [
            ['#059669', '#047857'], // Green
            ['#047857', '#064E3B'], // Deep green
            ['#5B7C99', '#475569'], // Slate blue
            ['#6B7280', '#4B5563'], // Grey
            ['#5F8F86', '#0F766E'], // Soft teal
            ['#A67C52', '#78716C'], // Taupe
            ['#008952', '#004d40'], // Brand teal
        ];

        const charCode = text.charCodeAt(0) || 0;
        const index = charCode % colors.length;
        return colors[index];
    };

    const getInitial = (text) => {
        if (!text) return '?';
        return text.charAt(0).toUpperCase();
    };

    const [color1, color2] = getGradientColor(fallbackText || alt);

    if (imageError || !src) {
        return (
            <div
                className={className}
                style={{
                    background: `linear-gradient(135deg, ${color1}, ${color2})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '48px',
                    fontWeight: '700',
                    textTransform: 'uppercase'
                }}
            >
                {getInitial(fallbackText || alt)}
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setImageError(true)}
        />
    );
};

export default ImageWithFallback;
