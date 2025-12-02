"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/app/utils/auth-context";
import { ensureAuthentication } from "@/app/utils/payment-auth-helper";
import Link from "next/link";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [isActivating, setIsActivating] = useState(true);
  const [isActivated, setIsActivated] = useState(false);
  
  const sessionId = searchParams.get("session_id");
  const jobId = searchParams.get("job_id");

  useEffect(() => {
    const activateJob = async () => {
      if (!sessionId || !jobId) {
        toast.error("Invalid payment session");
        router.push("/post-job");
        return;
      }

      try {
        console.log("Payment success: Ensuring authentication...");
        
        // Wait a bit for auth context to initialize and try to restore auth
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const isAuthenticated = await ensureAuthentication();
        
        if (!isAuthenticated) {
          console.error("Authentication could not be restored");
          toast.error("Your session expired during payment. Please log in again to activate your job.");
          router.push(`/login?redirect=/payment/success?session_id=${sessionId}&job_id=${jobId}`);
          return;
        }

        console.log("Authentication confirmed, proceeding with job activation...");

        // Import API client
        const { apiClient } = await import('@/app/utils/api-client');

        // Verify payment and activate job
        await apiClient.patch(`/api/jobs/${jobId}/`, {
          status: 'ACTIVE',
          payment_session_id: sessionId
        });

        setIsActivated(true);
        toast.success("Job activated successfully!");
        
        // Refresh user data in context
        if (refreshUser) {
          refreshUser();
        }
        
      } catch (error: any) {
        console.error("Job activation error:", error);
        
        if (error.status === 401 || error.status === 403) {
          toast.error("Authentication expired. Please log in again to activate your job.");
          router.push(`/login?redirect=/payment/success?session_id=${sessionId}&job_id=${jobId}`);
        } else {
          toast.error("Payment successful but job activation failed. Please contact support.");
        }
      } finally {
        setIsActivating(false);
      }
    };

    activateJob();
  }, [sessionId, jobId, router, refreshUser]);

  if (isActivating) {
    return (
      <div className="w-full h-screen flex flex-1 justify-center items-center">
        <Card className="w-[350px]">
          <div className="p-6">
            <div className="w-full flex justify-center">
              <Loader2 className="size-12 p-2 rounded-full bg-blue-500/30 text-blue-500 animate-spin" />
            </div>

            <div className="mt-3 text-center sm:mt-5 w-full">
              <h2 className="text-xl font-semibold">Activating Your Job...</h2>
              <p className="text-sm mt-2 text-muted-foreground tracking-tight">
                Please wait while we activate your job posting after payment verification.
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-screen flex flex-1 justify-center items-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <Check className="size-12 p-2 rounded-full bg-green-500/30 text-green-500" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h2 className="text-xl font-semibold">Payment Successful!</h2>
            <p className="text-sm mt-2 text-muted-foreground tracking-tight">
              {isActivated 
                ? "Congratulations! Your payment was successful and your job posting is now active and live."
                : "Your payment was processed successfully."
              }
            </p>

            <div className="space-y-2 mt-5">
              <Button asChild className="w-full">
                <Link href="/my-jobs">View My Jobs</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
