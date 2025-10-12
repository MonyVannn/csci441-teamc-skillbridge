import { SignUp } from "@clerk/nextjs";
import Image from "next/image";

export default function Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Image src="/bg.jpeg" alt="bg" fill />
      <SignUp />
    </div>
  );
}
