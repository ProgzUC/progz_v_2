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
            ['#6366f1', '#4f46e5'], // Indigo
            ['#8b5cf6', '#7c3aed'], // Violet
            ['#ec4899', '#db2777'], // Pink
            ['#f59e0b', '#d97706'], // Amber
            ['#10b981', '#059669'], // Emerald
            ['#3b82f6', '#2563eb'], // Blue
            ['#008952', '#004d40'], // Teal (default)
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
