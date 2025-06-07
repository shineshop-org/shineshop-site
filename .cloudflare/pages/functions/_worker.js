// This is a basic worker file that will allow Cloudflare Pages to use Functions
export default {
  async fetch(request, env, ctx) {
    // This is a fallback handler that will only be called if no other function matches
    return new Response("Not found", { status: 404 });
  }
}; 