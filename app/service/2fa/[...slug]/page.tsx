import React from 'react'
import { notFound } from 'next/navigation'

// This is required for static export
export function generateStaticParams() {
  // Return at least one fallback path for static export
  return [
    { slug: ['fallback'] }
  ]
}

export default function TwoFASlugPage({ params }: { params: { slug: string[] } }) {
  // Redirect to the main 2FA page, or handle specific slug paths if needed
  return notFound()
} 