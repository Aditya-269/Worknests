"use client";

import { LoginForm } from "@/components/forms/LoginForm";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import React, { Suspense } from "react";

const LoginPageContent = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <h1 className="text-2xl font-bold">
            Work<span className="text-primary">Nest</span>
          </h1>
        </Link>
        <LoginForm redirectUrl={redirectUrl} />
      </div>
    </div>
  );
};

const LoginPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
};

export default LoginPage;
