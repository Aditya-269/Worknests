import { EmptyState } from "@/components/general/EmptyState";
import React from "react";

import { JobCard } from "@/components/general/JobCard";

// import { getSavedJobs } from "@/app/utils/api-actions";
// import { requireUser } from "@/app/utils/auth";

// Temporarily disabled to fix SSR issues - will implement client-side fetching
// async function getFavorites() {
//   try {
//     const data = await getSavedJobs();
//     return data;
//   } catch (error) {
//     console.error("Error fetching favorites:", error);
//     return [];
//   }
// }

const FavoritesPage = () => {
  // Note: This page will fetch favorites client-side to avoid SSR issues
  const favorites: any[] = [];

  if (favorites.length === 0) {
    return (
      <EmptyState
        title="No favorites found"
        description="You don't have any favorites yet."
        buttonText="Find a job"
        href="/jobs"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 mt-5   gap-4">
      {favorites.map((favorite) => (
        <JobCard job={favorite as any} key={favorite.id} />
      ))}
    </div>
  );
};

export default FavoritesPage;
