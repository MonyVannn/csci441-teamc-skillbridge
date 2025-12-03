"use client";

import { AvailableProject } from "@/type";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { createApplication, isApplied } from "@/lib/actions/application";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { toast } from "sonner";
import { LoaderCircle, ShieldAlert } from "lucide-react";
import { User } from "@prisma/client";
import { hasCompleteProfile } from "@/lib/utils";
import Link from "next/link";

interface ApplyButtonProps {
  project: AvailableProject;
  user?: User | null;
}

export function ApplyButton({ project, user }: ApplyButtonProps) {
  const [isAppliedButton, setIsAppliedButton] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIncompleteProfileDialog, setShowIncompleteProfileDialog] =
    useState(false);
  const [formData, setFormData] = useState({
    coverLetter: "",
  });

  useEffect(() => {
    const checkApplied = async () => {
      const applied = await isApplied(project.id);
      setOpenDialog(false);
      setIsAppliedButton(!applied);
    };

    checkApplied();
  }, [project.id]);

  const handleApplyClick = () => {
    // Check if user has complete profile before opening the dialog
    const profileCheck = hasCompleteProfile(user || null);
    if (!profileCheck.isComplete) {
      setShowIncompleteProfileDialog(true);
      return;
    }
    setOpenDialog(true);
  };

  const handleApply = async () => {
    if (!formData.coverLetter) {
      toast.error("Please write a cover letter before submitting.");
      return;
    }

    if (isSubmitting) return; // Prevent multiple submissions

    setIsSubmitting(true);
    try {
      await createApplication(project.id, formData.coverLetter);
      setIsAppliedButton(false);
      setOpenDialog(false);
      setFormData((prev) => ({ ...prev, coverLetter: "" }));
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Failed to submit application:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again.";
      toast.error(`Failed to submit application. ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileCheck = hasCompleteProfile(user || null);

  return (
    <>
      {/* Incomplete Profile Alert Dialog */}
      <AlertDialog
        open={showIncompleteProfileDialog}
        onOpenChange={setShowIncompleteProfileDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Complete Your Profile
            </AlertDialogTitle>
            <AlertDialogDescription>
              To apply for projects, you need to complete your profile first.
              This helps project owners understand your qualifications better.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-foreground mb-2">
                Missing Information:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {profileCheck.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-muted-foreground">
              Please update your profile in the settings page to include all
              required information.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href={`/profile/${user?.clerkId}`}>Go to Profile</Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Application Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Button
          onClick={handleApplyClick}
          className="bg-[#695DCC] text-white p-2 hover:bg-[#695DCC]/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer font-semibold transition-all disabled:pointer-events-none disabled:opacity-50"
          disabled={!isAppliedButton}
        >
          {isAppliedButton ? "Apply Now" : "Applied"}
        </Button>
        <DialogContent className="shadow-2xl">
          <DialogHeader>
            <DialogTitle>Applying to {project.title}</DialogTitle>
            <DialogDescription>
              This action will submit your application and notify the project
              owner.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2">
            <Label htmlFor="coverLetter">Cover Letter</Label>
            <Textarea
              id="coverLetter"
              value={formData.coverLetter}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  coverLetter: e.target.value,
                }))
              }
              disabled={isSubmitting}
              className="min-h-[200px]"
              placeholder="Write your cover letter here..."
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={handleApply}
              className="bg-[#695DCC]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
