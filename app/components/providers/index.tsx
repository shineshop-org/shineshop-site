'use client';

import { StoreProvider } from './store-provider';
import RSCErrorHandler from './rsc-error-handler';
import { NavigationTracker } from './navigation-tracker';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreProvider>
        {children}
      </StoreProvider>
      <NavigationTracker />
      <RSCErrorHandler />
    </>
  );
} 