"use client";

import { useState, useEffect } from "react";
import { getAllCompanyApplications, updateApplicationStatus } from "@/app/utils/api-actions";
import { useAuth } from "@/app/utils/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { formatRelativeTime } from "@/app/utils/formatRelativeTime";
import { Loader2, User, Mail, FileText, Briefcase } from "lucide-react";
import Link from "next/link";

interface JobApplication {
  id: string;
  status: string;
  applied_at: string;
  cover_letter: string;
  user_email: string;
  user_name: string;
  user_resume: string;
  job_title: string;
  company_name: string;
}

export default function CompanyApplicationsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    
    if (user.user_type !== 'COMPANY') {
      toast.error('Only companies can view applications');
      return;
    }

    fetchApplications();
  }, [isAuthenticated, user]);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await getAllCompanyApplications();
      setApplications(response.results);
    } catch (error: any) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (applicationId: string, newStatus: string) => {
    try {
      setUpdatingStatus(applicationId);
      await updateApplicationStatus(applicationId, newStatus);
      
      // Update local state
      setApplications(applications.map(app => 
        app.id === applicationId 
          ? { ...app, status: newStatus }
          : app
      ));
      
      toast.success(`Application status updated to ${newStatus}`);
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
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
            <CardDescription>Please log in to view applications.</CardDescription>
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

  if (user.user_type !== 'COMPANY') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>Only companies can view job applications.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Job Applications</h1>
        <p className="text-muted-foreground">
          Manage applications across all your job postings
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
              You haven't received any job applications yet. Applications will appear here once candidates apply to your jobs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/post-job">Post a New Job</Link>
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
                      <User className="h-5 w-5" />
                      {application.user_name || application.user_email}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Briefcase className="h-4 w-4" />
                      Applied for: {application.job_title}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(application.status)}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {application.user_email}
                  </div>
                  
                  {application.cover_letter && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium text-sm">Cover Letter:</span>
                      </div>
                      <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md">
                        {application.cover_letter}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Applied {formatRelativeTime(new Date(application.applied_at))}
                    </span>
                    
                    <div className="flex items-center gap-3">
                      <Select
                        value={application.status}
                        onValueChange={(newStatus) => handleStatusUpdate(application.id, newStatus)}
                        disabled={updatingStatus === application.id}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="reviewed">Reviewed</SelectItem>
                          <SelectItem value="accepted">Accepted</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {updatingStatus === application.id && (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      )}
                    </div>
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