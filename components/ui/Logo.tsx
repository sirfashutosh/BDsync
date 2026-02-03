import React from 'react';
import { motion } from 'framer-motion';

interface LogoProps {
    className?: string;
    variant?: 'full' | 'icon';
}

export const Logo: React.FC<LogoProps> = ({ className, variant = 'full' }) => {

    // 1. Icon - User Provided Red Logo
    const IconImage = (
        <motion.div
            className={`relative w-10 h-10 rounded-full overflow-hidden shadow-sm ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <img
                src="/assets/logo-red-final.png"
                alt="Thoughtwin Icon"
                className="w-full h-full object-cover"
            />
        </motion.div>
    );

    if (variant === 'icon') {
        return (
            <div className={`relative flex items-center justify-center ${className}`}>
                {IconImage}
            </div>
        );
    }

    // 2. Full Logo - Icon + Text
    // Using the clean Icon + Text approach to avoid any unwanted artifacts from previous images.
    return (
        <div className={`relative inline-flex items-center gap-3 ${className}`} style={{ minWidth: 'fit-content' }}>

            {/* Icon Part */}
            <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
            >
                <img
                    src="/assets/logo-red-final.png"
                    alt="Thoughtwin"
                    className="h-10 w-10 object-contain rounded-full shadow-sm"
                />
            </motion.div>

            {/* Text Part - Clean Typography */}
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-[Outfit]">
                thoughtwin
            </span>
        </div>
    );
};
