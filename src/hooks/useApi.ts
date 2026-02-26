/**
 * useApi Hook
 * Provides consistent error handling and state management for API calls
 */

import { useState, useCallback } from 'react';
import { APIError } from '@/services/api';
import type { ErrorResponse } from '@/types/api';

interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: ErrorResponse | null;
}

export function useApi<T>(initialData: T | null = null) {
  const [state, setState] = useState<UseApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await apiCall();
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const errorResponse: ErrorResponse =
        err instanceof APIError && err.data
          ? err.data
          : {
              message: err instanceof Error ? err.message : 'An unexpected error occurred',
            };
      setState({ data: null, loading: false, error: errorResponse });
      throw err;
    }
  }, []);

  return {
    ...state,
    execute,
  };
}

export function useApiMutation<T, P = unknown>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const mutate = useCallback(async (apiCall: (payload: P) => Promise<T>, payload: P) => {
    setState({ data: null, loading: true, error: null });
    try {
      const result = await apiCall(payload);
      setState({ data: result, loading: false, error: null });
      return result;
    } catch (err) {
      const errorResponse: ErrorResponse =
        err instanceof APIError && err.data
          ? err.data
          : {
              message: err instanceof Error ? err.message : 'An unexpected error occurred',
            };
      setState({ data: null, loading: false, error: errorResponse });
      throw err;
    }
  }, []);

  return {
    ...state,
    mutate,
  };
}
