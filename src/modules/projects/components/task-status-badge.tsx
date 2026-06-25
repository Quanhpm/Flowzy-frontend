import { Badge } from "@/shared/components";
import type { TaskStatus } from "@/shared/types";

type TaskStatusBadgeProps = {
  status: TaskStatus;
  size?: "sm" | "md";
  className?: string;
};

const statusConfig: Record<TaskStatus, { tone: "neutral" | "brand" | "warning" | "success" | "danger"; label: string }> = {
  BACKLOG: { tone: "neutral", label: "Backlog" },
  TODO: { tone: "brand", label: "To Do" },
  IN_PROGRESS: { tone: "warning", label: "In Progress" },
  REVIEW: { tone: "brand", label: "Review" },
  DONE: { tone: "success", label: "Done" },
};

export function TaskStatusBadge({ status, size = "sm", className }: TaskStatusBadgeProps) {
  const config = statusConfig[status] || { tone: "neutral", label: status };
  return (
    <Badge tone={config.tone} size={size} className={className}>
      {config.label}
    </Badge>
  );
}
