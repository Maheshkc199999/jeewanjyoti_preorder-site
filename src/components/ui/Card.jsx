import { motion } from "framer-motion";

const Card = ({ children, className = "", hover = true, glass = false, ...props }) => {
    const baseClasses = `rounded-2xl transition-all duration-300 overflow-hidden ${glass
            ? "bg-white/80 backdrop-blur-md border border-white/50 shadow-xl"
            : "bg-white border border-gray-100 shadow-lg"
        }`;

    const hoverClasses = hover ? "hover:shadow-2xl hover:border-[var(--color-primary-200)]" : "";

    return (
        <motion.div
            whileHover={hover ? { y: -5 } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${baseClasses} ${hoverClasses} ${className}`}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export const CardHeader = ({ children, className = "" }) => (
    <div className={`p-6 border-b border-gray-50 ${className}`}>
        {children}
    </div>
);

export const CardContent = ({ children, className = "" }) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = "" }) => (
    <div className={`p-6 bg-gray-50/50 border-t border-gray-50 ${className}`}>
        {children}
    </div>
);

export default Card;
