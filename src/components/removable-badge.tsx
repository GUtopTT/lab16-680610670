import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function RemovableBadge({
  label,
  removeLabel,
  onRemove,
}: {
  label: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 bg-blue-50 pr-1 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300"
    >
      {label}
      <button
        type="button"
        aria-label={removeLabel}
        onClick={onRemove}
        className="rounded-full p-0.5 opacity-60 transition-opacity outline-none hover:opacity-100 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" />
      </button>
    </Badge>
  );
}
