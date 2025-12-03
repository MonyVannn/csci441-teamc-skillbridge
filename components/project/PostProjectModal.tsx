// Placeholder component for PostProjectModal
// TODO: Implement the actual post project modal functionality

interface PostProjectModalProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function PostProjectModal({
  open,
  onOpenChange,
}: PostProjectModalProps) {
  if (!open) return null;

  return (
    <div>
      {/* TODO: Implement modal UI */}
      Post Project Modal
    </div>
  );
}
