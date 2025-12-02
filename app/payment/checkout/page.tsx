"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/utils/auth-context";
import { saveAuthState } from "@/app/utils/auth-persistence";
import { debugStorage } from "@/app/utils/storage-debug";

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const jobId = searchParams.get("jobId");
  const { user, isAuthenticated, isLoading } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!jobId) {
      toast.error("Invalid job ID");
      router.push("/post-job");
      return;
    }
    
    // Don't check auth while still loading
    if (isLoading) {
      console.log('Auth still loading, waiting...');
      return;
    }
    
    // Check authentication only after loading is complete
    if (!isAuthenticated || !user) {
      console.log('User not authenticated, redirecting to login');
      toast.error("Please log in to continue with payment");
      router.push(`/login?redirect=/payment/checkout?jobId=${jobId}`);
      return;
    }
    
    // Debug storage state
    debugStorage();
    
    console.log('Checkout page loaded - User:', user?.email, 'JobId:', jobId);
  }, [jobId, router, isAuthenticated, user, isLoading]);

  const handleStripeCheckout = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Please log in to continue with payment");
      return;
    }

    setIsProcessing(true);
    try {
      // Save auth state before redirecting to Stripe
      saveAuthState();
      
      console.log("Auth state saved. User:", user.email, "Token exists:", !!localStorage.getItem('access_token'));

      // Create Stripe checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe checkout
      if (data.url) {
        // Final auth state save before leaving
        console.log("Redirecting to Stripe checkout, final auth state save...");
        saveAuthState();
        
        // Use window.location.assign instead of href for better tracking
        window.location.assign(data.url);
      } else {
        throw new Error('No checkout URL received');
      }
      
    } catch (error: any) {
      toast.error(`Payment setup failed: ${error.message}`);
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFreePosting = async () => {
    try {
      // For development - allow free job posting using the API client
      const { apiClient } = await import('@/app/utils/api-client');
      
      await apiClient.patch(`/api/jobs/${jobId}/`, {
        status: 'ACTIVE'
      });

      toast.success("Job posted successfully for free! Your job is now live.");
      setTimeout(() => {
        router.push("/my-jobs");
      }, 1000);
    } catch (error) {
      console.error('Free posting error:', error);
      toast.error("Failed to activate job. Please try again.");
    }
  };

  // Show loading while auth is being checked
  if (isLoading || !jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {isLoading ? (
            <>
              <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin mb-4" />
              <h1 className="text-2xl font-bold">Loading Payment Page...</h1>
              <p className="text-muted-foreground mt-2">Please wait while we verify your authentication</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold">Invalid Job ID</h1>
              <p className="text-muted-foreground mt-2">Redirecting back to job posting...</p>
            </>
          )}
        </div>
      </div>
    );
  }

  // Show loading if user is not yet authenticated (but not loading)
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin mb-4" />
          <h1 className="text-2xl font-bold">Checking Authentication...</h1>
          <p className="text-muted-foreground mt-2">Redirecting to login if needed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <CreditCard className="mx-auto h-16 w-16 text-blue-500 mb-4" />
          <h1 className="text-3xl font-bold">Complete Your Job Posting</h1>
          <p className="text-muted-foreground mt-2">
            Choose your payment method to activate and publish your job listing
          </p>
        </div>

        <div className="grid gap-6">
          {/* Payment Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Premium Job Posting
              </CardTitle>
              <CardDescription>
                Get maximum visibility with featured placement and priority listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium">30-day job listing</span>
                  <span className="text-2xl font-bold">$29.99</span>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Featured placement in search results</li>
                  <li>✓ Priority listing for 7 days</li>
                  <li>✓ Email notifications for new applications</li>
                  <li>✓ Detailed analytics dashboard</li>
                </ul>
                <Button 
                  className="w-full" 
                  onClick={handleStripeCheckout}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Pay with Stripe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Free Option for Development - Only show in development */}
          {process.env.NODE_ENV === 'development' && (
            <Card className="border-dashed">
              <CardHeader>
                <CardTitle className="text-muted-foreground">Development Mode</CardTitle>
                <CardDescription>
                  Skip payment for testing purposes (Development only)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleFreePosting}
                >
                  Post Job for Free (Dev Mode)
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={() => router.push("/post-job")}
            className="text-muted-foreground"
          >
            ← Back to Job Posting
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;