import { Badge } from "@/shared/components";
import type { TaskPriority } from "@/shared/types";

type TaskPriorityBadgeProps = {
  priority: TaskPriority;
  size?: "sm" | "md";
  className?: string;
};

const priorityConfig: Record<TaskPriority, { tone: "neutral" | "brand" | "warning" | "success" | "danger"; label: string }> = {
  LOW: { tone: "neutral", label: "Low" },
  MEDIUM: { tone: "warning", label: "Medium" },
  HIGH: { tone: "brand", label: "High" },
  URGENT: { tone: "danger", label: "Urgent" },
};

export function TaskPriorityBadge({ priority, size = "sm", className }: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority] || { tone: "neutral", label: priority };
  return (
    <Badge tone={config.tone} size={size} className={className}>
      {config.label}
    </Badge>
  );
}
