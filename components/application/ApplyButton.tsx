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
  DialogTrigger,
} from "@/components/ui/dialog";
import { createApplication, isApplied } from "@/lib/actions/application";
import { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { toast } from "sonner";
import { LoaderCircle } from "lucide-react";

interface ApplyButtonProps {
  project: AvailableProject;
}

export function ApplyButton({ project }: ApplyButtonProps) {
  const [isAppliedButton, setIsAppliedButton] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogTrigger
        className="bg-[#695DCC] text-white p-2 hover:bg-[#695DCC]/90 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm cursor-pointer font-semibold transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive"
        disabled={!isAppliedButton}
      >
        {isAppliedButton ? "Apply Now" : "Applied"}
      </DialogTrigger>
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
          <textarea
            value={formData.coverLetter}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                coverLetter: e.target.value,
              }))
            }
            disabled={isSubmitting}
            className="col-span-3 min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
  );
}
