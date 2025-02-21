import { useState, useCallback } from 'react';
import { ApiError } from '../types/auth';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: ApiError) => void;
  retryCount?: number;
  retryDelay?: number;
}

export function useApi<T = any>(
  apiCall: (...args: any[]) => Promise<T>,
  options: UseApiOptions<T> = {}
) {
  const {
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async (...args: any[]) => {
    setIsLoading(true);
    setError(null);

    let attempts = 0;
    const attemptCall = async (): Promise<T> => {
      try {
        const result = await apiCall(...args);
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err: any) {
        if (attempts < retryCount && err.status !== 401 && err.status !== 403) {
          attempts++;
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempts));
          return attemptCall();
        }
        throw err;
      }
    };

    try {
      const result = await attemptCall();
      setIsLoading(false);
      return result;
    } catch (err: any) {
      const apiError: ApiError = {
        message: err.message || 'An error occurred',
        code: err.code,
        status: err.status
      };
      setError(apiError);
      onError?.(apiError);
      setIsLoading(false);
      throw apiError;
    }
  }, [apiCall, onSuccess, onError, retryCount, retryDelay]);

  return {
    execute,
    data,
    error,
    isLoading,
    clearError: () => setError(null)
  };
}