import { describe, it, expect, vi } from 'vitest';
import { errorService, ErrorCategory, retryWithBackoff } from '../../services/errorService';

describe('ErrorService', () => {
    it('should be a singleton', () => {
        const instance1 = errorService;
        const instance2 = errorService; // Accessing the exported instance
        expect(instance1).toBe(instance2);
    });

    it('should notify subscribers when an error is logged', () => {
        const listener = vi.fn();
        const unsubscribe = errorService.subscribe(listener);

        errorService.log('Test error', ErrorCategory.SYSTEM);

        expect(listener).toHaveBeenCalledTimes(1);
        expect(listener).toHaveBeenCalledWith(expect.objectContaining({
            message: 'Test error',
            category: ErrorCategory.SYSTEM,
        }));

        unsubscribe();
    });

    it('should stop notifying after unsubscribe', () => {
        const listener = vi.fn();
        const unsubscribe = errorService.subscribe(listener);

        unsubscribe();
        errorService.log('Test error');

        expect(listener).not.toHaveBeenCalled();
    });
});

describe('retryWithBackoff', () => {
    it('should return the result if the function succeeds immediately', async () => {
        const fn = vi.fn().mockResolvedValue('success');
        const result = await retryWithBackoff(fn);
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry if the function fails initially', async () => {
        const fn = vi.fn()
            .mockRejectedValueOnce(new Error('fail'))
            .mockResolvedValue('success');

        const result = await retryWithBackoff(fn, 3, 10); // Short delay for test
        expect(result).toBe('success');
        expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should throw error if all retries fail', async () => {
        const fn = vi.fn().mockRejectedValue(new Error('fail'));

        await expect(retryWithBackoff(fn, 3, 10)).rejects.toThrow('fail');
        expect(fn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });
});
