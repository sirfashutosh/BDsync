import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from './Button';

interface CardProps extends HTMLMotionProps<"div"> {
    variant?: 'default' | 'glass' | 'interactive';
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', children, ...props }, ref) => {

        const variants = {
            default: "bg-white border border-slate-100 shadow-xl shadow-slate-200/50",
            glass: "bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl shadow-slate-200/40",
            interactive: "bg-white border border-slate-100 shadow-lg hover:shadow-xl hover:border-brand-200 transition-all cursor-pointer group"
        };

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={variant === 'interactive' ? { y: -4 } : undefined}
                className={cn("rounded-2xl overflow-hidden", variants[variant], className)}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);
Card.displayName = "Card";

export { Card };
