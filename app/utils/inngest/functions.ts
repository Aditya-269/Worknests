import { inngest } from "./client";
import { apiClient } from "../api-client";

export const handleJobExpiration = inngest.createFunction(
  { id: "job-expiration" },
  { event: "job/created" },
  async ({ event, step }) => {
    const { jobId, expirationDays } = event.data;

    // Wait for the specified duration
    await step.sleep("wait-for-expiration", `${expirationDays}d`);

    // Update job status to expired
    await step.run("update-job-status", async () => {
      try {
        // Call Django API to update job status
        await apiClient.patch(`/api/jobs/${jobId}/`, { 
          status: "EXPIRED" 
        });
      } catch (error) {
        console.error(`Failed to expire job ${jobId}:`, error);
        throw error;
      }
    });

    return { jobId, message: "Job marked as expired" };
  }
);
