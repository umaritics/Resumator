"use client";

import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User as UserIcon } from "lucide-react";

type ProfileDropdownProps = {
  user: User;
  onLogout: () => void;
};

export default function ProfileDropdown({
  user,
  onLogout,
}: ProfileDropdownProps) {
  const displayName =
    user.user_metadata?.full_name ??
    user.user_metadata?.name ??
    user.email ??
    "Account";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 p-2 rounded-full hover:bg-gray-200">
        <UserIcon className="h-6 w-6" />
        <span className="text-sm text-gray-700 max-w-[120px] truncate hidden lg:inline">
          {displayName}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/dashboard">Dashboard</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onLogout}>Logout</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
