// Cloudflare Pages middleware to prevent caching
export async function onRequest(context) {
  // Get the request and env from the context
  const { request, next, env } = context;
  
  // Get the response from the next middleware or the static asset
  const response = await next();
  
  // Clone the response
  const newResponse = new Response(response.body, response);
  
  // Add headers to prevent caching
  newResponse.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0');
  newResponse.headers.set('CDN-Cache-Control', 'no-store');
  newResponse.headers.set('Cloudflare-CDN-Cache-Control', 'no-store');
  newResponse.headers.set('Pragma', 'no-cache');
  newResponse.headers.set('Expires', '0');
  newResponse.headers.set('Surrogate-Control', 'no-store');
  
  // Add a timestamp to force fresh content
  newResponse.headers.set('X-Content-Fresh', Date.now().toString());
  
  // Return the modified response
  return newResponse;
} 