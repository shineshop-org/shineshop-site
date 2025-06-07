import React from 'react'
import { notFound } from 'next/navigation'

// This is required for static export
export function generateStaticParams() {
  // Return an empty array since we'll handle the catch-all route in the component
  return []
}

export default function TwoFASlugPage({ params }: { params: { slug: string[] } }) {
  // Redirect to the main 2FA page, or handle specific slug paths if needed
  return notFound()
} 