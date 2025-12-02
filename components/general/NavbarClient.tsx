"use client";

import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import { useAuth } from "@/app/utils/auth-context";
import { UserDropdown } from "./UserDropdown";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavbarClientProps {
  mobile?: boolean;
}

export function NavbarClient({ mobile = false }: NavbarClientProps) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Show loading state
    return mobile ? (
      <Button variant="outline" size="icon" disabled>
        <Menu className="h-6 w-6" />
      </Button>
    ) : (
      <div className="w-20 h-10 bg-muted rounded animate-pulse" />
    );
  }

  if (mobile) {
    return isAuthenticated && user ? (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="text-left">
            <SheetTitle>
              Job<span className="text-primary">Marshal</span>
            </SheetTitle>
            <SheetDescription>
              Welcome, {user.name}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 mt-6">
            <Link
              href="/"
              className="text-lg px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors duration-200"
            >
              Find Jobs
            </Link>
            {user.user_type === "COMPANY" && (
              <Link
                href="/post-job"
                className="text-lg px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors duration-200"
              >
                Post a Job
              </Link>
            )}
            <Link
              href="/my-jobs"
              className="text-lg px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors duration-200"
            >
              {user.user_type === "COMPANY" ? "My Jobs" : "Saved Jobs"}
            </Link>
            <UserDropdown
              email={user.email}
              name={user.name}
              image={user.image || ""}
              mobile={true}
            />
          </div>
        </SheetContent>
      </Sheet>
    ) : (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader className="text-left">
            <SheetTitle>
              Job<span className="text-primary">Marshal</span>
            </SheetTitle>
            <SheetDescription>
              Find or post your next job opportunity
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-4 mt-6">
            <Link
              href="/"
              className="text-lg px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors duration-200"
            >
              Find New Job
            </Link>
            <Link
              href="/login"
              className="text-lg px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 transition-colors duration-200"
            >
              Login
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop version
  return isAuthenticated && user ? (
    <div className="flex items-center gap-5">
      {/* Only show Post Job button for companies */}
      {user.user_type === "COMPANY" && (
        <Link href="/post-job" className={buttonVariants({ size: "lg" })}>
          Post Job
        </Link>
      )}
      <UserDropdown
        email={user.email}
        name={user.name}
        image={user.image || ""}
      />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link
        href="/login"
        className={buttonVariants({ variant: "default", size: "lg" })}
      >
        Login
      </Link>
    </div>
  );
}