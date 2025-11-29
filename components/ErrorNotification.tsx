import React, { useEffect, useState } from 'react';
import { errorService, AppError, ErrorCategory } from '../services/errorService';
import { X, AlertCircle, Wifi, ShieldAlert, Server } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const ErrorNotification: React.FC = () => {
    const [errors, setErrors] = useState<AppError[]>([]);

    useEffect(() => {
        const unsubscribe = errorService.subscribe((error) => {
            setErrors((prev) => [...prev, error]);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                removeError(error.id);
            }, 5000);
        });

        return unsubscribe;
    }, []);

    const removeError = (id: string) => {
        setErrors((prev) => prev.filter((e) => e.id !== id));
    };

    const getIcon = (category: ErrorCategory) => {
        switch (category) {
            case ErrorCategory.NETWORK: return <Wifi className="w-5 h-5" />;
            case ErrorCategory.AUTH: return <ShieldAlert className="w-5 h-5" />;
            case ErrorCategory.VALIDATION: return <AlertCircle className="w-5 h-5" />;
            case ErrorCategory.SYSTEM: return <Server className="w-5 h-5" />;
            default: return <AlertCircle className="w-5 h-5" />;
        }
    };

    const getColor = (category: ErrorCategory) => {
        switch (category) {
            case ErrorCategory.NETWORK: return 'bg-blue-50 text-blue-800 border-blue-200';
            case ErrorCategory.AUTH: return 'bg-red-50 text-red-800 border-red-200';
            case ErrorCategory.VALIDATION: return 'bg-yellow-50 text-yellow-800 border-yellow-200';
            case ErrorCategory.SYSTEM: return 'bg-gray-50 text-gray-800 border-gray-200';
            default: return 'bg-red-50 text-red-800 border-red-200';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {errors.map((error) => (
                    <motion.div
                        key={error.id}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg min-w-[300px] ${getColor(error.category)}`}
                    >
                        {getIcon(error.category)}
                        <p className="flex-1 text-sm font-medium">{error.message}</p>
                        <button
                            onClick={() => removeError(error.id)}
                            className="p-1 hover:bg-black/5 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ErrorNotification;
