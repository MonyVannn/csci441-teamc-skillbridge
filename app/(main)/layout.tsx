import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

// Lazy load ChatTab as it's not critical for initial page load
// Note: Removed ssr: false as this is a Server Component
const ChatTab = dynamic(() => import("@/components/ui/chat/ChatTab"));

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Toaster />
      <ChatTab />
      <Footer />
    </>
  );
}
