"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Configure NProgress
NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.08,
});

export function NavigationProgress() {
  const pathname = usePathname();
  const currentPath = useRef(pathname);

  useEffect(() => {
    // Finish progress when route changes
    if (currentPath.current !== pathname) {
      NProgress.done();
      currentPath.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    // Handle clicks on all anchor tags (including Next.js Link components)
    const handleClick = (event: MouseEvent) => {
      try {
        const target = event.target as HTMLElement;
        const anchor = target.closest("a");

        if (!anchor || !anchor.href) return;

        const targetUrl = new URL(anchor.href);
        const currentUrl = new URL(window.location.href);

        // Check if it's an internal navigation to a different page
        const isInternalNavigation =
          targetUrl.origin === currentUrl.origin &&
          targetUrl.pathname !== currentUrl.pathname &&
          !anchor.hasAttribute("target") && // Not opening in new tab
          !anchor.hasAttribute("download") && // Not a download link
          !event.ctrlKey && // Not ctrl+click
          !event.metaKey && // Not cmd+click (Mac)
          !event.shiftKey; // Not shift+click

        if (isInternalNavigation) {
          NProgress.start();
        }
      } catch (error) {
        // Ignore invalid URLs
        console.debug("Navigation progress error:", error);
      }
    };

    // Handle browser back/forward buttons
    const handlePopState = () => {
      NProgress.start();
    };

    // Add event listener to document to catch all clicks (including dynamic content)
    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return null;
}
