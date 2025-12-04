import Link from "next/link";

import { Button, buttonVariants } from "../ui/button";

import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "./ThemeToggle";
import { UserDropdown } from "./UserDropdown";
import { NavbarClient } from "./NavbarClient";

export async function Navbar() {

  return (
    <nav className="flex justify-between items-center py-5">
      <Link href="/" className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">
          Work<span className="text-primary">Nest</span>
        </h1>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center gap-5">
        <ThemeToggle />
        <NavbarClient />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-4">
        <ThemeToggle />
        <NavbarClient mobile />
      </div>
    </nav>
  );
}
