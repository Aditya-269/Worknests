"use client";

import { apiClient } from './api-client';
import { authClient } from './auth-client';

// Types for API requests
export interface CompanyData {
  name: string;
  location: string;
  website: string;
  xAccount?: string;
  about: string;
  logo?: string;
}

export interface JobSeekerData {
  name: string;
  about: string;
  resume: string;
}

export interface JobData {
  jobTitle: string;
  employmentType: string;
  location: string;
  salaryFrom: number;
  salaryTo: number;
  jobDescription: string;
  listingDuration: number;
  benefits: string[];
}

export interface JobPost {
  id: string;
  job_title: string;  // Django API uses snake_case
  employment_type: string;
  location: string;
  salary_from: number;
  salary_to: number;
  job_description: string;
  listing_duration: number;
  benefits: string[];
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED';
  applications: number;
  company_details: {
    name: string;
    logo?: string | null;
    about?: string;
    location: string;
    website?: string;
    x_account?: string;
  };
  created_at: string;
  
  // Computed properties for frontend compatibility
  jobTitle?: string;
  employmentType?: string;
  salaryFrom?: number;
  salaryTo?: number;
  jobDescription?: string;
  listingDuration?: number;
  createdAt?: string;
  companyDetails?: {
    name: string;
    logo?: string | null;
    about?: string;
    location: string;
  };
}

// Company actions
export async function createCompany(data: CompanyData): Promise<void> {
  try {
    // Transform camelCase to snake_case for Django API
    const apiData = {
      name: data.name,
      location: data.location,
      website: data.website,
      x_account: data.xAccount, // Convert xAccount to x_account
      about: data.about,
      logo: data.logo
    };
    
    await apiClient.post('/api/auth/create-company/', apiData);
    // Complete onboarding after creating company profile
    await authClient.completeOnboarding();
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      // Re-create apiData for retry
      const retryApiData = {
        name: data.name,
        location: data.location,
        website: data.website,
        x_account: data.xAccount,
        about: data.about,
        logo: data.logo
      };
      await apiClient.post('/api/auth/create-company/', retryApiData);
      await authClient.completeOnboarding();
    } else {
      throw error;
    }
  }
}

// Job seeker actions
export async function createJobSeeker(data: JobSeekerData): Promise<void> {
  try {
    // Validate that resume is a proper URL
    if (!data.resume || !data.resume.trim()) {
      throw new Error('Resume is required');
    }
    
    // Ensure resume is a valid URL (basic check)
    try {
      new URL(data.resume);
    } catch {
      throw new Error('Resume must be a valid URL');
    }
    
    await apiClient.post('/api/auth/create-jobseeker/', data);
    // Complete onboarding after creating job seeker profile
    await authClient.completeOnboarding();
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      await apiClient.post('/api/auth/create-jobseeker/', data);
      await authClient.completeOnboarding();
    } else {
      throw error;
    }
  }
}

// Job post actions
export async function createJob(data: JobData): Promise<string> {
  try {
    // Transform camelCase field names to snake_case for Django API
    const apiData = {
      job_title: data.jobTitle,
      employment_type: data.employmentType,
      location: data.location,
      salary_from: data.salaryFrom,
      salary_to: data.salaryTo,
      job_description: data.jobDescription,
      listing_duration: data.listingDuration,
      benefits: data.benefits
    };
    
    console.log("Sending job data to API:", apiData);
    const response = await apiClient.post<JobPost>('/api/jobs/', apiData);
    console.log("API response:", response);
    
    if (!response || !response.id) {
      throw new Error("Invalid API response: missing job ID");
    }
    
    return response.id.toString(); // Ensure it's a string
  } catch (error: any) {
    console.error("Job creation API error:", error);
    if (error.status === 401) {
      console.log("Attempting token refresh...");
      await authClient.refreshToken();
      // Re-create apiData for retry
      const retryApiData = {
        job_title: data.jobTitle,
        employment_type: data.employmentType,
        location: data.location,
        salary_from: data.salaryFrom,
        salary_to: data.salaryTo,
        job_description: data.jobDescription,
        listing_duration: data.listingDuration,
        benefits: data.benefits
      };
      const response = await apiClient.post<JobPost>('/api/jobs/', retryApiData);
      console.log("Retry API response:", response);
      
      if (!response || !response.id) {
        throw new Error("Invalid API response after retry: missing job ID");
      }
      
      return response.id.toString();
    } else {
      throw error;
    }
  }
}

export async function updateJobPost(data: JobData, jobId: string): Promise<void> {
  try {
    // Transform camelCase field names to snake_case for Django API
    const apiData = {
      job_title: data.jobTitle,
      employment_type: data.employmentType,
      location: data.location,
      salary_from: data.salaryFrom,
      salary_to: data.salaryTo,
      job_description: data.jobDescription,
      listing_duration: data.listingDuration,
      benefits: data.benefits
    };
    
    await apiClient.put(`/api/jobs/${jobId}/`, apiData);
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      // Re-create apiData for retry
      const retryApiData = {
        job_title: data.jobTitle,
        employment_type: data.employmentType,
        location: data.location,
        salary_from: data.salaryFrom,
        salary_to: data.salaryTo,
        job_description: data.jobDescription,
        listing_duration: data.listingDuration,
        benefits: data.benefits
      };
      await apiClient.put(`/api/jobs/${jobId}/`, retryApiData);
    } else {
      throw error;
    }
  }
}

export async function deleteJobPost(jobId: string): Promise<void> {
  try {
    console.log(`Attempting to delete job with ID: ${jobId}`);
    const response = await apiClient.delete(`/api/jobs/${jobId}/`);
    console.log('Delete response:', response);
  } catch (error: any) {
    console.error('Delete error:', error);
    if (error.status === 401) {
      console.log('Refreshing token and retrying...');
      await authClient.refreshToken();
      const retryResponse = await apiClient.delete(`/api/jobs/${jobId}/`);
      console.log('Retry delete response:', retryResponse);
    } else {
      throw error;
    }
  }
}

// Saved job actions
export async function saveJobPost(jobId: string): Promise<void> {
  try {
    await apiClient.post(`/api/jobs/${jobId}/save/`);
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      await apiClient.post(`/api/jobs/${jobId}/save/`);
    } else {
      throw error;
    }
  }
}

export async function unsaveJobPost(savedJobPostId: string): Promise<void> {
  try {
    await apiClient.delete(`/api/saved-jobs/${savedJobPostId}/remove/`);
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      await apiClient.delete(`/api/saved-jobs/${savedJobPostId}/remove/`);
    } else {
      throw error;
    }
  }
}

// Transform Django API response to frontend format
function transformJobPost(job: any): JobPost {
  return {
    ...job,
    // Add camelCase properties for frontend compatibility
    jobTitle: job.job_title,
    employmentType: job.employment_type,
    salaryFrom: job.salary_from,
    salaryTo: job.salary_to,
    jobDescription: job.job_description,
    listingDuration: job.listing_duration,
    createdAt: job.created_at,
    companyDetails: job.company_details,
    // Also provide the company format expected by JobCard
    company: job.company_details ? {
      name: job.company_details.name,
      logo: job.company_details.logo,
      about: job.company_details.about || '',
      location: job.company_details.location,
    } : undefined
  };
}

// Fetch job posts (public endpoint - no auth required)
export async function getJobPosts(params?: {
  search?: string;
  employment_type?: string;
  location?: string;
  page?: number;
}): Promise<{ results: JobPost[]; count: number; next?: string; previous?: string }> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.employment_type) queryParams.append('employment_type', params.employment_type);
    if (params?.location) queryParams.append('location', params.location);
    if (params?.page) queryParams.append('page', params.page.toString());

    const url = `/api/jobs/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Fetching jobs from:', url);
    
    // Use direct fetch for public endpoints to avoid auth issues
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://backend-github-production-1bc7.up.railway.app';
    const fullUrl = `${backendUrl}${url}`;
    console.log('Full URL:', fullUrl);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Jobs fetched successfully:', data.count, 'jobs found');
    
    // Transform the results
    return {
      ...data,
      results: data.results.map(transformJobPost)
    };
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw error;
  }
}

export async function getJobPost(jobId: string): Promise<JobPost> {
  const job = await apiClient.get(`/api/jobs/${jobId}/`);
  return transformJobPost(job);
}

export async function getMyJobs(): Promise<JobPost[]> {
  try {
    const response = await apiClient.get<{ results: any[] }>('/api/my-jobs/');
    return (response.results || []).map(transformJobPost);
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      const response = await apiClient.get<{ results: any[] }>('/api/my-jobs/');
      return (response.results || []).map(transformJobPost);
    } else {
      throw error;
    }
  }
}

export async function getSavedJobs(): Promise<JobPost[]> {
  try {
    const response = await apiClient.get<{ results: any[] }>('/api/saved-jobs/');
    // Extract job details from saved job objects
    return response.results?.map(saved => saved.job_details) || [];
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      const response = await apiClient.get<{ results: any[] }>('/api/saved-jobs/');
      return response.results?.map(saved => saved.job_details) || [];
    } else {
      throw error;
    }
  }
}

// Job application actions
export interface JobApplicationData {
  cover_letter?: string;
}

export async function applyToJob(jobId: string, data: JobApplicationData = {}): Promise<void> {
  try {
    await apiClient.post(`/api/jobs/${jobId}/apply/`, data);
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      await apiClient.post(`/api/jobs/${jobId}/apply/`, data);
    } else {
      throw error;
    }
  }
}

export async function getMyApplications(): Promise<any[]> {
  try {
    const response = await apiClient.get<{ results: any[] }>('/api/my-applications/');
    return response.results || [];
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      const response = await apiClient.get<{ results: any[] }>('/api/my-applications/');
      return response.results || [];
    } else {
      throw error;
    }
  }
}

// Company application management
export async function getJobApplications(jobId: string): Promise<{ results: any[], count: number, job_title: string }> {
  try {
    const response = await apiClient.get<{ results: any[], count: number, job_title: string }>(`/api/jobs/${jobId}/applications/`);
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      const response = await apiClient.get<{ results: any[], count: number, job_title: string }>(`/api/jobs/${jobId}/applications/`);
      return response;
    } else {
      throw error;
    }
  }
}

export async function getAllCompanyApplications(): Promise<{ results: any[], count: number }> {
  try {
    const response = await apiClient.get<{ results: any[], count: number }>('/api/company-applications/');
    return response;
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      const response = await apiClient.get<{ results: any[], count: number }>('/api/company-applications/');
      return response;
    } else {
      throw error;
    }
  }
}

export async function updateApplicationStatus(applicationId: string, status: string): Promise<void> {
  try {
    await apiClient.patch(`/api/applications/${applicationId}/status/`, { status });
  } catch (error: any) {
    if (error.status === 401) {
      await authClient.refreshToken();
      await apiClient.patch(`/api/applications/${applicationId}/status/`, { status });
    } else {
      throw error;
    }
  }
}