export enum ErrorCategory {
    NETWORK = 'NETWORK',
    VALIDATION = 'VALIDATION',
    AUTH = 'AUTH',
    SYSTEM = 'SYSTEM',
}

export interface AppError {
    message: string;
    category: ErrorCategory;
    timestamp: number;
    id: string;
}

type ErrorListener = (error: AppError) => void;

class ErrorService {
    private static instance: ErrorService;
    private listeners: ErrorListener[] = [];

    private constructor() { }

    public static getInstance(): ErrorService {
        if (!ErrorService.instance) {
            ErrorService.instance = new ErrorService();
        }
        return ErrorService.instance;
    }

    public log(message: string, category: ErrorCategory = ErrorCategory.SYSTEM): void {
        const error: AppError = {
            message,
            category,
            timestamp: Date.now(),
            id: Math.random().toString(36).substr(2, 9),
        };

        console.error(`[${category}] ${message}`);
        this.notifyListeners(error);
    }

    public subscribe(listener: ErrorListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== listener);
        };
    }

    private notifyListeners(error: AppError): void {
        this.listeners.forEach((listener) => listener(error));
    }
}

export const errorService = ErrorService.getInstance();

/**
 * Retries a function with exponential backoff.
 * @param fn The function to retry.
 * @param retries Maximum number of retries (default: 3).
 * @param delay Initial delay in ms (default: 1000).
 */
export async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    retries: number = 3,
    delay: number = 1000
): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries === 0) throw error;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return retryWithBackoff(fn, retries - 1, delay * 2);
    }
}
