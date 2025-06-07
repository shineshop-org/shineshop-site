'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function RSCErrorHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Listen for the specific error and handle full page reloads when RSC payloads fail
    const handleRSCError = (event: ErrorEvent) => {
      // Check if this is an RSC payload error
      if (
        event.message?.includes('Failed to fetch RSC payload') ||
        event.error?.message?.includes('Failed to fetch RSC payload')
      ) {
        console.log('Detected RSC payload error, handling gracefully');
        
        // Force a full page reload instead of client-side navigation
        window.location.href = pathname;
      }
    };

    // Add the event listener
    window.addEventListener('error', handleRSCError);

    // Clean up
    return () => {
      window.removeEventListener('error', handleRSCError);
    };
  }, [pathname]);

  // This component doesn't render anything
  return null;
} 