'use client'

/**
 * Error handling utilities to prevent unwanted page refreshes
 * and provide better error feedback in the UI
 */

// Global error event handler to catch unhandled exceptions
export function setupGlobalErrorHandlers() {
  if (typeof window !== 'undefined') {
    // Save original console.error to avoid infinite loops
    const originalConsoleError = console.error;
    
    // Override console.error to better handle React errors
    console.error = (...args) => {
      // Call original console.error
      originalConsoleError(...args);
      
      // Check if this is a React error that might cause a refresh
      const errorString = args.join(' ');
      if (
        errorString.includes('React will try to recreate this component tree') ||
        errorString.includes('Consider adding an error boundary') ||
        errorString.includes('uncaught error')
      ) {
        // Log for debugging
        originalConsoleError('Prevented potential refresh-causing error');
      }
    };
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
      // Prevent default behavior which might refresh the page
      event.preventDefault();
    });
    
    // Handle runtime errors
    window.addEventListener('error', (event) => {
      console.error('Runtime Error:', event.error);
      // Prevent default behavior which might refresh the page
      event.preventDefault();
      return true; // Prevents the browser from displaying its own error message
    });
  }
}

// Utility to safely execute functions that might throw errors
export function safeExecute<T>(fn: () => T, fallback: T): T {
  try {
    return fn();
  } catch (error) {
    console.error('Error in safeExecute:', error);
    return fallback;
  }
}

// Utility to safely execute async functions
export async function safeExecuteAsync<T>(
  fn: () => Promise<T>,
  fallback: T,
  errorHandler?: (error: unknown) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error('Error in safeExecuteAsync:', error);
    if (errorHandler) {
      errorHandler(error);
    }
    return fallback;
  }
}

// Error boundary fallback component props
export interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

// Default error message by error type
export const getDefaultErrorMessage = (error: unknown, language: 'en' | 'vi' = 'vi'): string => {
  if (!error) {
    return language === 'en' ? 'An unknown error occurred' : 'Đã xảy ra lỗi không xác định';
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return language === 'en' 
    ? 'An unexpected error occurred' 
    : 'Đã xảy ra lỗi không mong muốn';
}; 