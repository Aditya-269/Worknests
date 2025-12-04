"use client";

import { EmptyState } from "./EmptyState";
import { PaginationComponent } from "./PaginationComponent";
import { JobCard } from "./JobCard";
import { getJobPosts, JobPost } from "@/app/utils/api-actions";
import { useState, useEffect } from "react";

// Convert to client-side data fetching
function useJobs(
  page: number = 1,
  pageSize: number = 10,
  jobTypes: string[] = [],
  location: string = ""
) {
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        console.log('JobListings: Starting job fetch with params:', { page, jobTypes, location });
        
        const response = await getJobPosts({
          page,
          employment_type: jobTypes.length > 0 ? jobTypes[0] : undefined,
          location: location && location !== "worldwide" ? location : undefined,
        });

        console.log('JobListings: Received response:', response);
        setJobs(response.results || []);
        setTotalPages(Math.ceil((response.count || 0) / pageSize));
      } catch (error) {
        console.error('JobListings: Failed to fetch jobs:', error);
        setJobs([]);
        setTotalPages(0);
      } finally {
        setLoading(false);
      }
    }

    fetchJobs();
  }, [page, pageSize, jobTypes, location]);

  return { jobs, totalPages, loading, currentPage: page };
}

export default function JobListings({
  currentPage,
  jobTypes,
  location,
}: {
  currentPage: number;
  jobTypes: string[];
  location: string;
}) {
  const { jobs, totalPages, loading } = useJobs(currentPage, 7, jobTypes, location);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading jobs...</span>
      </div>
    );
  }

  return (
    <>
      {jobs.length > 0 ? (
        <div className="flex flex-col gap-6">
          {jobs.map((job, index) => (
            <JobCard job={job as any} key={job.id || index} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="No jobs found"
          description="Try searching for a different job title or location."
          buttonText="Clear all filters"
          href="/"
        />
      )}

      <div className="flex justify-center mt-6">
        <PaginationComponent totalPages={totalPages} currentPage={currentPage} />
      </div>
    </>
  );
}
