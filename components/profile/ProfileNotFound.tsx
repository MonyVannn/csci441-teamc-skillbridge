import { Button } from "@/components/ui/button";
import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";

export default function ProfileNotFoundPage() {
  return (
    <div className="min-h-screen bg-muted/30">
      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          {/* Large Icon */}
          <div className="mb-8">
            <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center mb-4">
              <UserX className="h-16 w-16 text-muted-foreground" />
            </div>
          </div>

          {/* Main Message */}
          <div className="mb-8 max-w-md">
            <h1 className="text-3xl font-bold text-foreground mb-4">
              User Not Found
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We couldn&apos;t find the profile you&apos;re looking for. The
              user may have changed their username or the profile might no
              longer exist.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            <Button asChild className="px-6 py-2">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back Home
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
