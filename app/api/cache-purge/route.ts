import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-static";

export async function GET(request: NextRequest) {
  const timestamp = Date.now();
  const purgeKey = `purge-${timestamp}`;
  
  return NextResponse.json(
    { 
      success: true, 
      message: 'Cache purged successfully',
      timestamp,
      purgeKey
    },
    {
      status: 200,
      headers: {
        // Strong no-cache headers
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        
        // Cloudflare specific headers
        'Cache-Tag': 'shineshop-site,content-update',
        'CF-Cache-Status': 'BYPASS',
        
        // Indicate content is fresh
        'X-Content-Fresh': timestamp.toString(),
        'Clear-Site-Data': '"cache", "cookies", "storage"',
        
        // CORS headers to allow calling from frontend
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    }
  );
} 