'use client';

import { StoreProvider } from './store-provider';
import RSCErrorHandler from './rsc-error-handler';
import { NavigationTracker } from './navigation-tracker';
import { ThemeProvider } from 'next-themes';
import { SystemPreferencesProvider } from '@/app/components/system-preferences';
import ErrorBoundary from './error-boundary';
import ErrorProvider from './error-provider';
import GlobalErrorHandler from './global-error-handler';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ErrorProvider>
        <ErrorBoundary>
          <StoreProvider>
            <ThemeProvider 
              attribute="class" 
              defaultTheme="system"
              enableSystem={true} 
              storageKey="theme-preference"
            >
              {children}
            </ThemeProvider>
          </StoreProvider>
        </ErrorBoundary>
      </ErrorProvider>
      <NavigationTracker />
      <RSCErrorHandler />
      <GlobalErrorHandler />
      <SystemPreferencesProvider />
    </>
  );
} 