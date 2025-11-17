"use client";

import { UserApplications } from "@/components/setting/UserApplication";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

/**
 * Client wrapper component for UserApplications
 * Handles the callback when applications are marked as seen
 * This triggers a router refresh to update the badge count in the header
 */
export default function ApplicationsClientWrapper() {
  const router = useRouter();

  const handleApplicationsSeen = useCallback(() => {
    // Refresh the current route to update server components (like the header with badge counts)
    router.refresh();
  }, [router]);

  return <UserApplications onApplicationsSeen={handleApplicationsSeen} />;
}
