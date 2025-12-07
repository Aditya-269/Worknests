"use client";

import { useState, useEffect } from "react";
import { getMyApplications } from "@/app/utils/api-actions";
import { useAuth } from "@/app/utils/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { formatCurrency } from "@/app/utils/formatCurrency";
import { Loader2, Briefcase, Building, MapPin, Clock } from "lucide-react";
import Link from "next/link";

interface MyApplication {
  id: string;
  status: string;
  applied_at: string;
  cover_letter: string;
  job_title: string;
  company_name: string;
  job: {
    id: string;
    salary_from: number;
    salary_to: number;
    location: string;
    employment_type: string;
  };
}

export default function MyApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [applications, setApplications] = useState<MyApplication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    if (user.user_type !== 'JOB_SEEKER') {
      toast.error('Only job seekers can view their applications');
      return;
    }

    fetchApplications();
  }, [isAuthenticated, user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const applications = await getMyApplications();
      setApplications(applications);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load your applications');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'pending': return 'Your application is being reviewed';
      case 'reviewed': return 'Your application has been reviewed';
      case 'accepted': return 'Congratulations! Your application was accepted';
      case 'rejected': return 'Your application was not selected';
      default: return 'Application status unknown';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Please log in to view your applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/login">Login</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.user_type !== 'JOB_SEEKER') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only job seekers can view applications.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Applications</h1>
        <p className="text-muted-foreground">
          Track the status of your job applications
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : applications.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Applications Yet</CardTitle>
            <CardDescription>
              You haven't applied to any jobs yet. Start browsing and apply to jobs that interest you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/">Browse Jobs</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5" />
                      {application.job_title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Building className="h-4 w-4" />
                      {application.company_name}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {application.job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4" />
                      {application.job.employment_type}
                    </div>
                    {application.job.salary_from && application.job.salary_to && (
                      <div>
                        {formatCurrency(application.job.salary_from)} - {formatCurrency(application.job.salary_to)}
                      </div>
                    )}
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm font-medium text-gray-700">
                      {getStatusMessage(application.status)}
                    </p>
                  </div>

                  {application.cover_letter && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Your Cover Letter:</h4>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Applied {formatRelativeTime(new Date(application.applied_at))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}