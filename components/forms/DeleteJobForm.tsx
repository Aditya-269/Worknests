"use client";

import { deleteJobPost } from "@/app/utils/api-actions";
import { GeneralSubmitButton } from "@/components/general/SubmitButtons";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Trash2Icon, ArrowLeftIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface DeleteJobFormProps {
  jobId: string;
}

export function DeleteJobForm({ jobId }: DeleteJobFormProps) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return;
    }
    
    try {
      setPending(true);
      console.log("Starting delete process for job:", jobId);
      
      await deleteJobPost(jobId);
      
      console.log("Delete completed successfully");
      toast.success("Job deleted successfully!");
      router.push("/my-jobs");
    } catch (error: any) {
      console.error("Delete job error:", error);
      
      // More specific error handling
      if (error.status === 404) {
        toast.error("Job not found. It may have already been deleted.");
      } else if (error.status === 403) {
        toast.error("You don't have permission to delete this job.");
      } else if (error.status === 401) {
        toast.error("Please log in again to delete this job.");
      } else {
        toast.error(`Failed to delete job: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <Card className="max-w-lg mx-auto w-full">
      <CardHeader>
        <CardTitle>Are you absolutely sure?</CardTitle>
        <CardDescription>
          This action cannot be undone. This will permanently delete your job
          posting and remove it from our servers.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end gap-4">
        <Link
          href={`/my-jobs`}
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeftIcon className="size-4" />
          Cancel
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={pending}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 h-9 px-3"
        >
          {pending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Deleting...
            </>
          ) : (
            <>
              <Trash2Icon className="size-4" />
              Delete Job
            </>
          )}
        </button>
      </CardFooter>
    </Card>
  );
}