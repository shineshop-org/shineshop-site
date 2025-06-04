import { redirect } from 'next/navigation'

export default function TwoFactorAuthRedirect({ params }: { params: { slug: string[] }}) {
	// This page just redirects to the main 2FA page
	// The actual handling of the slug is done in the main page
	return redirect(`/service/2fa`)
} 