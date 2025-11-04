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
      const clerkCloseButton = document.querySelector(
        "[data-clerk-close-button]"
      );
      if (clerkCloseButton) {
        (clerkCloseButton as HTMLElement).click();
      }

      // Alternative: Press Escape key to close modal
      const escapeEvent = new KeyboardEvent("keydown", {
        key: "Escape",
        code: "Escape",
        keyCode: 27,
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(escapeEvent);

      // Small delay to ensure modal closes before navigation
      setTimeout(() => {
        router.push(href);
      }, 50);
    },
    [router]
  );

  return navigate;
}
