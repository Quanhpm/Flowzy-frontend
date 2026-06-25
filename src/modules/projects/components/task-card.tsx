import { cn } from "@/shared/lib";
import type { TaskSummaryDto } from "../types";
import { TaskPriorityBadge } from "./task-priority-badge";
import { Calendar, CheckSquare } from "lucide-react";

type TaskCardProps = {
  task: TaskSummaryDto;
  onClick: () => void;
  onDragStart: (e: React.DragEvent, taskId: number, currentStatus: string) => void;
};

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const isOverdue = task.overdue;

  // Format initials for assignees
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    return new Intl.DateTimeFormat("vi-VN", {
      month: "short",
      day: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, Number(task.id), task.status)}
      onClick={onClick}
      className={cn(
        "group relative flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-secondary/30 hover:shadow-md cursor-grab active:cursor-grabbing select-none"
      )}
    >
      {/* Priority Tag */}
      <div className="flex items-center justify-between gap-2">
        <TaskPriorityBadge priority={task.priority} />
        
        {/* Version Indicator */}
        <span className="text-[10px] text-muted-foreground/50 font-mono">
          v{task.version}
        </span>
      </div>

      {/* Task Title */}
      <h4 className="m-0 text-sm font-bold text-foreground line-clamp-2 leading-snug group-hover:text-brand-primary transition-colors">
        {task.title}
      </h4>

      {/* Description Preview (if any) */}
      {task.description && (
        <p className="m-0 text-xs text-muted leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3 mt-1">
        {/* Indicators */}
        <div className="flex items-center gap-3 text-muted text-xs">
          {/* Due date */}
          {task.dueAt && (
            <div
              className={cn(
                "flex items-center gap-1 font-medium",
                isOverdue ? "text-red-600" : "text-muted"
              )}
              title={isOverdue ? "Overdue task!" : "Due date"}
            >
              <Calendar className="size-3.5" />
              <span>{formatDate(task.dueAt)}</span>
            </div>
          )}

          {/* Checklist progress */}
          {task.checklistCount > 0 && (
            <div className="flex items-center gap-1 font-medium" title="Checklist progress">
              <CheckSquare className="size-3.5" />
              <span>
                {task.checklistCompletedCount}/{task.checklistCount}
              </span>
            </div>
          )}
        </div>

        {/* Assignees Avatars */}
        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1.5 overflow-hidden ml-auto">
            {task.assignees.slice(0, 3).map((assignee) => (
              <div
                key={assignee.studentId}
                className="inline-flex size-6 items-center justify-center rounded-full border border-surface bg-brand-secondary text-[9px] font-bold text-white shadow-sm"
                title={assignee.fullName}
              >
                {getInitials(assignee.fullName)}
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div
                className="inline-flex size-6 items-center justify-center rounded-full border border-surface bg-muted text-[9px] font-medium text-foreground"
                title={`${task.assignees.length - 3} more assignees`}
              >
                +{task.assignees.length - 3}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
