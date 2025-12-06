"use client";

import { useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      // Send error message to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error
        }, window.location.origin);
        window.close();
      } else {
        router.push(`/login?error=${encodeURIComponent(error)}`);
      }
      return;
    }

    if (code) {
      // Exchange code for access token
      exchangeCodeForToken(code);
    } else {
      // No code or error, something went wrong
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: 'No authorization code received'
        }, window.location.origin);
        window.close();
      } else {
        router.push('/login?error=oauth_failed');
      }
    }
  }, [searchParams, router]);

  const exchangeCodeForToken = async (code: string) => {
    try {
      // Send code to our backend to exchange for access token
      // This is more secure than doing it client-side with the secret
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/exchange/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: `${window.location.origin}/auth/google/callback`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to exchange code for token');
      }

      const data = await response.json();
      
      // Send success message with access token to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_SUCCESS',
          accessToken: data.access_token
        }, window.location.origin);
        
        // Don't try to close window immediately - let parent handle it
        setTimeout(() => {
          try {
            window.close();
          } catch (e) {
            // COOP may prevent this - that's OK
          }
        }, 100);
      } else {
        // If not in popup, redirect to login with token
        router.push(`/login?google_token=${data.access_token}`);
      }
    } catch (error) {
      console.error('Error exchanging code for token:', error);
      
      if (window.opener) {
        window.opener.postMessage({
          type: 'GOOGLE_AUTH_ERROR',
          error: error instanceof Error ? error.message : 'Failed to complete authentication'
        }, window.location.origin);
        window.close();
      } else {
        router.push('/login?error=oauth_failed');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing Google authentication...</p>
      </div>
    </div>
  );
}

export default function GoogleCallback() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}