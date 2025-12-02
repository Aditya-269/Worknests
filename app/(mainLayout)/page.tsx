import { JobFilters } from "@/components/general/JobFilters";
import JobListings from "@/components/general/JobListings";
import JobListingsLoading from "@/components/general/JobListingsLoading";
import { Suspense } from "react";
import { AlertCircle } from "lucide-react";

type SearchParamsProps = {
  searchParams: Promise<{
    page?: string;
    jobTypes?: string;
    location?: string;
    error?: string;
  }>;
};

export default async function Home({ searchParams }: SearchParamsProps) {
  const params = await searchParams;
  const currentPage = Number(params.page) || 1;
  const jobTypes = params.jobTypes?.split(",") || [];
  const location = params.location || "";
  const error = params.error;

  // Create a composite key from all filter parameters
  const filterKey = `page=${currentPage};types=${jobTypes.join(
    ","
  )};location=${location}`;

  return (
    <div className="space-y-4">
      {/* Error Messages */}
      {error === "company_only" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Access Restricted</h3>
            <p className="text-sm text-red-600">
              Only companies can post job listings. Job seekers can browse and apply for jobs here.
            </p>
          </div>
        </div>
      )}
      
      {error === "job_seeker_only" && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-800">Access Restricted</h3>
            <p className="text-sm text-red-600">
              This feature is only available for job seekers. Companies can post jobs and manage applications.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-8">
        <JobFilters />
        <div className="col-span-2 flex flex-col gap-6">
          <Suspense key={filterKey} fallback={<JobListingsLoading />}>
            <JobListings
              currentPage={currentPage}
              jobTypes={jobTypes}
              location={location}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
