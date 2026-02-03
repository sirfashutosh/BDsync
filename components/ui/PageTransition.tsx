import React from 'react';
import { motion } from 'framer-motion';

export const PageTransition = ({ children, className }: { children: React.ReactNode, className?: string }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
