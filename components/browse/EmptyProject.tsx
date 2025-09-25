import { Frown } from "lucide-react";

export function EmptyProject() {
  return (
    <div className="w-full flex items-start justify-center text-center text-gray-500">
      <div className="pt-44">
        <Frown className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No projects found. </p>
        <p>Try adjusting your filters.</p>
      </div>
    </div>
  );
}
