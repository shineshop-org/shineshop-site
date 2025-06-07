import React from 'react'
import { notFound } from 'next/navigation'

// This is required for static export
export function generateStaticParams() {
  // Return at least one fallback path for static export
  return [
    { slug: ['fallback'] }
  ]
}

interface CatchAllSlugPageProps {
  params: {
    slug: string[]
  }
}

export default function CatchAllSlugPage({ params }: CatchAllSlugPageProps) {
  // Redirect to the main page, or handle specific slug paths if needed
  return notFound()
} 