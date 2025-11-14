import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

// Lazy load ChatTab as it's not critical for initial page load
const ChatTab = dynamic(() => import("@/components/ui/chat/ChatTab"), {
  ssr: false,
});

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
