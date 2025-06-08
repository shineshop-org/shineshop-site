import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const timestamp = Date.now();
  
  return NextResponse.json(
    { 
      success: true, 
      message: 'Cache headers set successfully',
      timestamp,
      cache: false
    },
    {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
        'CDN-Cache-Control': 'no-store',
        'Cloudflare-CDN-Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Surrogate-Control': 'no-store',
        'X-Content-Fresh': timestamp.toString(),
        'Clear-Site-Data': '"cache", "cookies", "storage"'
      }
    }
  );
} 