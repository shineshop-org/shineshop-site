// Redirect /index.html to / to avoid static export artifacts
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Redirect /index.html to /
  if (url.pathname.endsWith('/index.html')) {
    return Response.redirect(`${url.origin}${url.pathname.replace('/index.html', '/')}`, 301);
  }
  
  return context.next();
} 