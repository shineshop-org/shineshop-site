import { redirect } from 'next/navigation'

// This tells Next.js which paths to pre-generate for static export
export function generateStaticParams() {
	// Return an empty array since we don't know possible secret keys in advance
	// We'll handle the actual secret key client-side
	return []
}

export default function TwoFactorAuthRedirect({ params }: { params: { slug: string[] }}) {
	// This page just redirects to the main 2FA page
	// The actual handling of the slug is done in the main page
	return redirect(`/service/2fa`)
} 