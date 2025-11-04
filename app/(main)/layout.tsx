import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ChatTab from "@/components/ui/chat/ChatTab";
import { Toaster } from "@/components/ui/sonner";

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
