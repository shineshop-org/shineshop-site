// Import built Cloudflare worker from the output directory
// This will properly handle RSC requests
import worker from '../../../.vercel/output/worker';

// Export all request handlers from the worker
export default worker;

// Optional: Add some additional error handling
addEventListener('fetch', event => {
  try {
    event.respondWith(worker.fetch(event.request));
  } catch (e) {
    // If there's an error, log it and return a fallback response
    console.error('Worker error:', e);
    event.respondWith(new Response('An error occurred processing your request', { status: 500 }));
  }
}); 