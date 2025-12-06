"use client";

import { EmptyState } from "@/components/general/EmptyState";
import React, { useState, useEffect } from "react";
import { JobCard } from "@/components/general/JobCard";
import { getSavedJobs } from "@/app/utils/api-actions";
import { useAuth } from "@/app/utils/auth-context";

const FavoritesPage = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    async function fetchFavorites() {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await getSavedJobs();
        console.log('Fetched saved jobs:', data);
        setFavorites(data || []);
        setError(null);
      } catch (error) {
        console.error("Error fetching favorites:", error);
        setError("Failed to load saved jobs");
        setFavorites([]);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <EmptyState
        title="Please log in"
        description="You need to be logged in to view your saved jobs."
        buttonText="Log in"
        href="/login"
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">Loading saved jobs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading saved jobs"
        description={error}
        buttonText="Try again"
        href="/favorites"
      />
    );
  }

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="No favorites found"
        description="You don't have any favorites yet. Start browsing jobs and save the ones you like!"
        buttonText="Find a job"
        href="/"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 mt-5 gap-4">
      {favorites.map((favorite, index) => (
        <JobCard job={favorite as any} key={favorite.id || index} />
      ))}
    </div>
  );
};

export default FavoritesPage;
