import { useRouter } from "next/navigation";
import { useCallback } from "react";
import NProgress from "nprogress";

/**
 * Custom hook to handle navigation while closing any open Clerk modals
 * This ensures that Clerk's UserButton modal doesn't stay open after navigation
 */
export function useClerkNavigation() {
  const router = useRouter();

  const navigate = useCallback(
    (href: string) => {
      // Start the loading progress bar
      NProgress.start();

      // Close any open Clerk modals by clicking the backdrop or removing focus
      // Clerk modals typically have a backdrop element with specific attributes
      const clerkBackdrop = document.querySelector(
        "[data-clerk-modal-backdrop]"
      );
      if (clerkBackdrop) {
        (clerkBackdrop as HTMLElement).click();
      }

      // Also try to close by finding and clicking the Clerk modal close button
      // Using the actual Clerk close button class
      const clerkCloseButton = document.querySelector(".cl-modalCloseButton");
      if (clerkCloseButton) {
        (clerkCloseButton as HTMLElement).click();
      }

      // Use requestAnimationFrame to ensure modal closes before navigation
      // This waits for the next browser paint cycle, ensuring DOM updates are complete
      requestAnimationFrame(() => {
        router.push(href);
      });
    },
    [router]
  );

  return navigate;
}
