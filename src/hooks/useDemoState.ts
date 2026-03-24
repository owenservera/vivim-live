import { useState, useCallback } from 'react';
import { DemoError, DemoState, DemoPreferences, DemoSession, DemoErrorType } from '@/types/demo';

// Core demo state hook
export function useDemoState<T extends DemoState = any>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  // Persist preferences to localStorage
  const updatePreferences = useCallback((updater: Partial<DemoPreferences>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updater }
    }));
    // Persist to localStorage
    localStorage.setItem(`demo-${initialState.id}-preferences`, JSON.stringify({
      ...state.preferences,
      ...updater
    }));
  }, [state.preferences, initialState.id]);

  // Manage session state (ephemeral)
  const updateSession = useCallback((updater: Partial<DemoSession>) => {
    setState(prev => ({
      ...prev,
      session: { ...prev.session, ...updater }
    }));
  }, []);

  // Error handling
  const setError = useCallback((error: DemoError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Reset to initial
  const reset = useCallback(() => {
    setState(initialState);
    // Also clear localStorage preferences
    localStorage.removeItem(`demo-${initialState.id}-preferences`);
  }, [initialState]);

  return {
    state,
    setState,
    updatePreferences,
    updateSession,
    setError,
    reset,
  };
}

// Async operations hook
export function useDemoAsync<T, P extends any[] = any[]>(
  asyncFn: (...args: P) => Promise<T>
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: DemoError | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await asyncFn(...args);
      setState({ data, loading: false, error: null });
    } catch (err: any) {
      const error: DemoError = {
        type: DemoErrorType.VALIDATION as any,
        message: err.message || 'An error occurred',
        code: err.code,
        recoverable: true,
      };
      setState({ data: null, loading: false, error });
    }
  }, [asyncFn]);

  return {
    state,
    execute,
    reset: () => setState({ data: null, loading: false, error: null })
  };
}

// Persistence hook
export function useDemoPersistence<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  const save = useCallback((value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  }, [key]);

  return [state, save] as const;
}
