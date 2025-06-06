# Cloudflare Pages Deployment Notes

## Current Status

The site is now configured for static export to work with Cloudflare Pages. Here's what changed:

### Changes Made
1. **Output Mode**: Changed from `standalone` to `export` in `next.config.js`
2. **API Routes Removed**: Removed all API routes as they're not compatible with static export
3. **Data Persistence**: Currently using localStorage only (no server sync)

### Limitations with Static Export

1. **No API Routes**: API routes don't work with static export
2. **No Server-Side Features**: No SSR, ISR, or middleware
3. **Data Storage**: Only localStorage is available (no server persistence)

## Future Improvements

To enable server-side data persistence on Cloudflare Pages, we need to:

### Option 1: Cloudflare Functions
Create separate Cloudflare Functions for API endpoints:
```
/functions/api/store-data.js
```

### Option 2: Cloudflare Workers
Deploy a separate Worker to handle API requests

### Option 3: External Database
Use an external service like:
- Supabase
- Firebase
- PlanetScale
- Neon

## Current Data Storage

While on static export:
- Data is stored in browser's localStorage
- Each browser maintains its own data
- No cross-browser sync
- Data persists unless user clears browser data

## Build Command

For Cloudflare Pages, use:
```
npm run build
```

Output directory: `out`

## Testing Locally

```bash
npm run build
npx serve out
```

## Monitoring Deployment

1. Check Cloudflare Pages dashboard
2. View build logs
3. Test all routes after deployment completes 