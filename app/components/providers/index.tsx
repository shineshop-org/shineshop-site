'use client';

import { StoreProvider } from './store-provider';
import RSCErrorHandler from './rsc-error-handler';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreProvider>
        {children}
      </StoreProvider>
      <RSCErrorHandler />
    </>
  );
} 