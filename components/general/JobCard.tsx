"use client";

import Link from "next/link";
import { Card, CardHeader } from "../ui/card";
import { MapPin, User2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatCurrency } from "@/app/utils/formatCurrency";
import Image from "next/image";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { useState } from "react";

interface iAppProps {
  job: {
    id: string;
    jobTitle: string;
    job_title: string;
    salaryFrom: number;
    salary_from: number;
    salaryTo: number;
    salary_to: number;
    employmentType: string;
    employment_type: string;
    location: string;
    createdAt: Date | string;
    created_at: Date | string;
    // Backend API format (flat fields)
    company_name?: string;
    company_logo?: string;
    // Legacy nested format (for backwards compatibility)
    company?: {
      logo: string | null;
      name: string;
      about: string;
      location: string;
    };
    companyDetails?: {
      logo: string | null;
      name: string;
      about?: string;
      location: string;
    };
  };
}

export function JobCard({ job }: iAppProps) {
  const [imageError, setImageError] = useState(false);
  
  // Handle both API format (flat fields) and legacy nested format
  const company = job.company || job.companyDetails || {
    name: job.company_name || 'Unknown Company',
    logo: job.company_logo || null,
    about: '',
    location: job.location
  };
  
  // Use snake_case fields from API if camelCase not available
  const jobTitle = job.jobTitle || job.job_title;
  const salaryFrom = job.salaryFrom || job.salary_from;
  const salaryTo = job.salaryTo || job.salary_to;
  const employmentType = job.employmentType || job.employment_type;
  const createdAt = job.createdAt || job.created_at;
  
  if (!company.name) {
    console.warn('Job missing company data:', job);
    return null; // Don't render if no company data
  }

  return (
    <Link href={`/job/${job.id}`}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:border-primary relative">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4">
            {company.logo && !imageError ? (
              <Image
                src={company.logo}
                alt={company.name}
                width={48}
                height={48}
                className="size-12 rounded-lg"
                onError={() => setImageError(true)}
                onLoad={() => setImageError(false)}
              />
            ) : (
              <div className="bg-red-500 size-12 rounded-lg flex items-center justify-center">
                <User2 className="size-6 text-white" />
              </div>
            )}
            <div className="flex flex-col flex-grow">
              <h1 className="text-xl md:text-2xl font-bold">{jobTitle}</h1>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {company.name}
                </p>
                <span className="hidden md:inline text-muted-foreground">
                  •
                </span>
                <Badge className="rounded-full" variant="secondary">
                  {employmentType}
                </Badge>
                <span className="hidden md:inline text-muted-foreground">
                  •
                </span>
                <Badge className="rounded-full">{job.location}</Badge>
                <span className="hidden md:inline text-muted-foreground">
                  •
                </span>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(salaryFrom)} - {formatCurrency(salaryTo)}
                </p>
              </div>
            </div>

            <div className="md:ml-auto">
              <div className="flex items-center gap-2">
                <MapPin className="size-4" />
                <h1 className="text-base md:text-lg font-semibold whitespace-nowrap">
                  {job.location}
                </h1>
              </div>
              <p className="text-sm text-muted-foreground md:text-right">
                {formatRelativeTime(typeof createdAt === 'string' ? new Date(createdAt) : createdAt)}
              </p>
            </div>
          </div>
          <div className="!mt-5">
            <p className="text-base text-muted-foreground line-clamp-2">
              {company.about || "No description available"}
            </p>
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
