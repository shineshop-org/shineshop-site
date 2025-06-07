// Cloudflare Pages Functions routes configuration
export const onRequest = async ({ request, next, env }) => {
  const url = new URL(request.url);
  
  // Handle redirect for /sheet
  if (url.pathname === '/sheet' || url.pathname === '/sheet/') {
    return Response.redirect('https://docs.google.com/spreadsheets/d/1ZYv6Q5JaDyc_geHP67g9F3PUNjpSbc31b3u4GR_o93o/edit?gid=1592107766#gid=1592107766', 301);
  }
  
  // Continue to the next middleware or route handler
  return next();
}; 