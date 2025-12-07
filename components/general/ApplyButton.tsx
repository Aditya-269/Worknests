"use client";

import { useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import { applyToJob } from "@/app/utils/api-actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ApplyButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  isAuthenticated: boolean;
  userType?: string;
}

export function ApplyButton({ 
  jobId, 
  jobTitle, 
  companyName, 
  isAuthenticated, 
  userType 
}: ApplyButtonProps) {
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  const handleApply = async () => {
    if (!isAuthenticated) return;
    
    setIsApplying(true);
    try {
      await applyToJob(jobId);
      setHasApplied(true);
      toast.success(`Successfully applied to ${jobTitle} at ${companyName}!`);
    } catch (error: any) {
      console.error('Application error:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message?.includes('already applied')) {
        setHasApplied(true);
        toast.info('You have already applied to this job');
      } else {
        toast.error('Failed to submit application. Please try again.');
      }
    } finally {
      setIsApplying(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Button asChild className="w-full">
        <Link href="/login">
          Login to Apply
        </Link>
      </Button>
    );
  }

  if (userType === 'company') {
    return (
      <Button disabled className="w-full" variant="outline">
        Companies cannot apply for jobs
      </Button>
    );
  }

  if (hasApplied) {
    return (
      <Button disabled className="w-full" variant="outline">
        Application Submitted ✓
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleApply} 
      disabled={isApplying}
      className="w-full"
    >
      {isApplying ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Applying...
        </>
      ) : (
        'Apply now'
      )}
    </Button>
  );
}