"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Heart } from "lucide-react";
import { saveJobPost } from "@/app/utils/api-actions";
import { toast } from "sonner";

interface SaveJobButtonProps {
  jobId: string;
  jobTitle: string;
  companyName: string;
  isAuthenticated: boolean;
  initialIsSaved?: boolean;
}

export function SaveJobButton({ 
  jobId, 
  jobTitle, 
  companyName, 
  isAuthenticated,
  initialIsSaved = false
}: SaveJobButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveJob = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    try {
      if (!isSaved) {
        // Save the job
        await saveJobPost(jobId);
        setIsSaved(true);
        toast.success(`Saved ${jobTitle} at ${companyName}!`);
      } else {
        // Unsave the job - we'll need to call the save endpoint again to toggle
        // The Django API should handle toggling automatically
        await saveJobPost(jobId);
        setIsSaved(false);
        toast.success(`Removed ${jobTitle} from saved jobs`);
      }
    } catch (error: any) {
      console.error('Save job error:', error);
      
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.message?.includes('already saved')) {
        // If it's already saved, toggle the state
        setIsSaved(!isSaved);
        toast.info(isSaved ? 'Job removed from saved jobs' : 'Job saved successfully');
      } else {
        toast.error('Failed to save job. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      className="flex items-center gap-2"
      onClick={handleSaveJob}
      disabled={!isAuthenticated || isLoading}
    >
      <Heart className={`size-4 ${isSaved ? 'fill-current text-red-500' : ''}`} />
      {isSaved ? 'Saved' : 'Save Job'}
    </Button>
  );
}