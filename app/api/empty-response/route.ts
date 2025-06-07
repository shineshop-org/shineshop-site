import { NextResponse } from 'next/server';

// This endpoint returns an empty 200 response for any requests
// Used to silence 404 errors for RSC data files that don't exist
export async function GET() {
  return new NextResponse('', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}

export async function POST() {
  return GET();
}

// Set dynamic to force for deployments
export const dynamic = 'force-dynamic'; 