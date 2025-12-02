"use client";

import { useAuth } from "./auth-context";
import { redirect, useRouter } from "next/navigation";
import { useEffect } from "react";

// Client-side hook for requiring authentication
export function useRequireAuth() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  return { user, isLoading, isAuthenticated };
}

// Client-side hook for requiring company role
export function useRequireCompany() {
  const { user, isLoading, isAuthenticated } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.user_type !== "COMPANY") {
      // Show error message for job seekers
      console.log(`User type ${user.user_type} cannot access this page. Redirecting...`);
      router.push("/?error=company_only");
    }
  }, [user, isLoading, isAuthenticated, router]);

  return { user, isLoading };
}

// Client-side hook for requiring job seeker role
export function useRequireJobSeeker() {
  const { user, isLoading, isAuthenticated } = useRequireAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated && user && user.user_type !== "JOB_SEEKER") {
      console.log(`User type ${user.user_type} cannot access this page. Redirecting...`);
      router.push("/?error=job_seeker_only");
    }
  }, [user, isLoading, isAuthenticated, router]);

  return { user, isLoading };
}

// For server components, we'll create separate server-side utilities
// These will be replaced with API calls to Django backend