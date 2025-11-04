import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";
import type { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <DocsLayout
        tree={source.pageTree}
        {...baseOptions()}
        sidebar={{
          collapsible: false,
        }}
      >
        {children}
      </DocsLayout>
    </div>
  );
}
