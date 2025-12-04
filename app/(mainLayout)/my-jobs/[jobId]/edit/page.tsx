"use client";

import { getJobPost } from "@/app/utils/api-actions";
import { useRequireCompany } from "@/app/utils/hooks";
import { EditJobForm } from "@/components/forms/EditJobForm";

import { useRouter } from "next/navigation";
import React, { useEffect, useState, use } from "react";
import { JobPost } from "@/app/utils/api-actions";

type Params = Promise<{ jobId: string }>;

const EditJobPage = ({ params }: { params: Params }) => {
  const { jobId } = use(params);
  const { user, isLoading } = useRequireCompany();
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchJobPost() {
      if (user && jobId) {
        try {
          const data = await getJobPost(jobId);
          setJobPost(data);
        } catch (error) {
          console.error("Failed to fetch job post:", error);
          router.push("/my-jobs");
        } finally {
          setLoading(false);
        }
      }
    }

    if (!isLoading && user) {
      fetchJobPost();
    }
  }, [user, isLoading, jobId, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !jobPost) return null;

  return (
    <>
      <EditJobForm jobPost={jobPost as any} />
    </>
  );
};

export default EditJobPage;
