"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function PostJobError() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Access Restricted</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Only companies can post job listings. Job seekers can browse and apply for jobs.
          </p>
          <div className="space-y-2">
            <Link href="/" className="w-full">
              <Button className="w-full">Browse Jobs</Button>
            </Link>
            <Link href="/onboarding" className="w-full">
              <Button variant="outline" className="w-full">
                Change Account Type
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}