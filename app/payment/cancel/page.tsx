"use client";

import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { XIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const CancelledPage = () => {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("job_id");

  return (
    <div className="w-full h-screen flex flex-1 justify-center items-center">
      <Card className="w-[350px]">
        <div className="p-6">
          <div className="w-full flex justify-center">
            <XIcon className="size-12 p-2 rounded-full bg-red-500/30 text-red-500" />
          </div>

          <div className="mt-3 text-center sm:mt-5 w-full">
            <h2 className="text-xl font-semibold">Payment Cancelled</h2>
            <p className="text-sm mt-2 text-muted-foreground tracking-tight">
              No worries, you won't be charged. Your job is saved as draft and you can try payment again.
            </p>

            <div className="space-y-2 mt-5">
              {jobId && (
                <Button asChild className="w-full">
                  <Link href={`/payment/checkout?jobId=${jobId}`}>Try Payment Again</Link>
                </Button>
              )}
              <Button asChild variant="outline" className="w-full">
                <Link href="/my-jobs">View My Jobs</Link>
              </Button>
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">Go to Homepage</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CancelledPage;
