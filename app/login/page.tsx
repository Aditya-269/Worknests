"use client";

import { LoginForm } from "@/components/forms/LoginForm";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/public/logo.png";

const LoginPage = () => {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');

  return (
    <div className="min-h-screen w-screen flex items-center justify-center">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link href="/" className="flex items-center gap-2 self-center">
          <Image src={Logo} alt="Logo" className="size-10" />
          <h1 className="text-2xl font-bold">
            Job<span className="text-primary">Marshal</span>
          </h1>
        </Link>
        <LoginForm redirectUrl={redirectUrl} />
      </div>
    </div>
  );
};

export default LoginPage;
