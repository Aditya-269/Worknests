import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { benefits } from "@/app/utils/listOfBenefits";
import Image from "next/image";
import { Edit, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { auth } from "@/app/utils/auth";
import { getFlagEmoji } from "@/app/utils/countriesList";
import { JsonToHtml } from "@/components/general/JsonToHtml";

async function getMyJob(jobId: string, userId?: string) {
  try {
    // Direct server-side fetch to Django API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/api/jobs/${jobId}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      if (response.status === 404) {
        return notFound();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jobData = await response.json();
    
    if (!jobData) {
      return notFound();
    }

    // Check if this job belongs to the current user
    // TODO: Add proper ownership check when user authentication is available
    // For now, we'll allow access to any job

    return {
      jobTitle: jobData.job_title,
      jobDescription: jobData.job_description,
      location: jobData.location,
      employmentType: jobData.employment_type,
      benefits: jobData.benefits,
      createdAt: new Date(jobData.created_at),
      listingDuration: jobData.listing_duration,
      status: jobData.status,
      company: {
        name: jobData.company_details?.name || 'Unknown Company',
        logo: jobData.company_details?.logo || null,
        location: jobData.company_details?.location || jobData.location,
        about: jobData.company_details?.about || '',
      },
    };
  } catch (error) {
    console.error('Error fetching job:', error);
    return notFound();
  }
}

type Params = Promise<{ jobId: string }>;

const MyJobPage = async ({ params }: { params: Params }) => {
  const { jobId } = await params;
  
  const session = await auth();
  
  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login');
  }

  const jobData = await getMyJob(jobId, session?.user?.id || undefined);
  const locationFlag = getFlagEmoji(jobData.location);

  return (
    <div className="container mx-auto py-8">
      <div className="grid lg:grid-cols-[1fr,400px] gap-8">
        {/* Main Content */}
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">{jobData.jobTitle}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="font-medium">{jobData.company.name}</span>
                <Badge className="rounded-full" variant="secondary">
                  {jobData.employmentType}
                </Badge>
                <span className="hidden md:inline text-muted-foreground">
                  •
                </span>
                <Badge className="rounded-full">
                  {locationFlag && <span className="mr-1">{locationFlag}</span>}
                  {jobData.location}
                </Badge>
                <Badge 
                  variant={jobData.status === 'active' ? 'default' : 'outline'}
                  className="rounded-full"
                >
                  {jobData.status}
                </Badge>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href={`/my-jobs/${jobId}/edit`}>
                  <Edit className="size-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/my-jobs/applications`}>
                  <Users className="size-4 mr-2" />
                  Applications
                </Link>
              </Button>
              <Button variant="destructive" asChild>
                <Link href={`/my-jobs/${jobId}/delete`}>
                  <Trash2 className="size-4 mr-2" />
                  Delete
                </Link>
              </Button>
            </div>
          </div>

          <section>
            <JsonToHtml json={JSON.parse(jobData.jobDescription)} />
          </section>

          <section>
            <h3 className="font-semibold mb-4">Benefits</h3>
            <div className="flex flex-wrap gap-3">
              {benefits.map((benefit) => {
                const isOffered = jobData.benefits.includes(benefit.id);
                return (
                  <Badge
                    key={benefit.id}
                    variant={isOffered ? "default" : "outline"}
                    className={`text-sm px-4 py-1.5 rounded-full ${
                      !isOffered && " opacity-75 cursor-not-allowed"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {benefit.icon}
                      {benefit.label}
                    </span>
                  </Badge>
                );
              })}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Job Management Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Job Management</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your job posting settings and view applications.
                </p>
              </div>
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href={`/my-jobs/${jobId}/edit`}>
                    <Edit className="size-4 mr-2" />
                    Edit Job
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/my-jobs/applications`}>
                    <Users className="size-4 mr-2" />
                    View Applications
                  </Link>
                </Button>
                <Button variant="destructive" className="w-full" asChild>
                  <Link href={`/my-jobs/${jobId}/delete`}>
                    <Trash2 className="size-4 mr-2" />
                    Delete Job
                  </Link>
                </Button>
              </div>
            </div>
          </Card>

          {/* Job Details Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Job Details</h3>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Expires on
                  </span>
                  <span className="text-sm">
                    {new Date(
                      jobData.createdAt.getTime() +
                        jobData.listingDuration * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Posted on
                  </span>
                  <span className="text-sm">
                    {jobData.createdAt.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Employment type
                  </span>
                  <span className="text-sm">{jobData.employmentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Status
                  </span>
                  <Badge variant={jobData.status === 'active' ? 'default' : 'outline'}>
                    {jobData.status}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Location
                  </span>
                  <Badge variant="secondary">{jobData.location}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Company Card */}
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src={
                    jobData.company.logo ??
                    `https://avatar.vercel.sh/${jobData.company.name}`
                  }
                  alt={jobData.company.name}
                  width={48}
                  height={48}
                  className="rounded-full size-12"
                  unoptimized={true}
                />
                <div>
                  <h3 className="font-semibold">{jobData.company.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {jobData.company.about}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MyJobPage;