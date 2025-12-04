import { SignupForm } from "@/components/forms/SignupForm";
import Link from "next/link";
import React from "react";

const SignupPage = () => {
  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <h1 className="text-2xl font-bold">
            Work<span className="text-primary">Nest</span>
          </h1>
        </Link>
        <SignupForm />
      </div>
    </div>
  );
};

export default SignupPage;