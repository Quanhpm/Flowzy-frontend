import { Badge } from "@/shared/components";
import type { ProblemStatus } from "@/shared/types";

type ProblemStatusBadgeProps = {
  status: ProblemStatus;
  size?: "sm" | "md";
  className?: string;
};

const statusConfig: Record<ProblemStatus, { tone: "neutral" | "brand" | "warning" | "success" | "danger"; label: string }> = {
  ACTIVE: { tone: "success", label: "Active" },
  INACTIVE: { tone: "neutral", label: "Inactive" },
  PENDING_REVIEW: { tone: "warning", label: "Pending Review" },
  APPROVED: { tone: "success", label: "Approved" },
  REJECTED: { tone: "danger", label: "Rejected" },
  ARCHIVED: { tone: "neutral", label: "Archived" },
};

export function ProblemStatusBadge({ status, size = "sm", className }: ProblemStatusBadgeProps) {
  const config = statusConfig[status] || { tone: "neutral", label: status };
  return (
    <Badge tone={config.tone} size={size} className={className}>
      {config.label}
    </Badge>
  );
}
