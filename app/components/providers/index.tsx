'use client';

import { StoreProvider } from './store-provider';
import RSCErrorHandler from './rsc-error-handler';
import { NavigationTracker } from './navigation-tracker';
import { ThemeProvider } from 'next-themes';
import { SystemPreferencesProvider } from '@/app/components/system-preferences';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
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
      <NavigationTracker />
      <RSCErrorHandler />
      <SystemPreferencesProvider />
    </>
  );
} 