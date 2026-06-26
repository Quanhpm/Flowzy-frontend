import { useState } from "react";
import { cn } from "@/shared/lib";
import type { TaskStatus } from "@/shared/types";
import type { TaskSummaryDto } from "../types";
import { TaskCard } from "./task-card";
import { CheckCircle2, MoreHorizontal, Plus } from "lucide-react";

type KanbanColumnProps = {
  status: TaskStatus;
  label: string;
  tasks: TaskSummaryDto[];
  onTaskClick: (taskId: number) => void;
  onAddTaskClick: (status: TaskStatus) => void;
  onTaskMove: (taskId: number, targetStatus: TaskStatus, position: number) => void;
  onDragStart: (e: React.DragEvent, taskId: number, currentStatus: string) => void;
};

export function KanbanColumn({
  status,
  label,
  tasks,
  onTaskClick,
  onAddTaskClick,
  onTaskMove,
  onDragStart,
}: KanbanColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const taskIdStr = e.dataTransfer.getData("text/plain");
    const sourceStatus = e.dataTransfer.getData("application/x-task-status");
    
    if (!taskIdStr) return;
    
    const taskId = Number(taskIdStr);
    
    // If status matches, don't trigger unless ordering changes, but standard move to end of column is default
    if (sourceStatus === status) return;
    
    // Position is at the end of the current task list
    onTaskMove(taskId, status, tasks.length);
  };

  const statusDotClassNames: Record<TaskStatus, string> = {
    BACKLOG: "border-slate-300 bg-white",
    TODO: "border-blue-300 bg-white",
    IN_PROGRESS: "border-yellow-400 bg-yellow-50",
    REVIEW: "border-indigo-400 bg-indigo-50",
    DONE: "border-slate-900 bg-slate-900",
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex h-full min-h-[535px] w-[292px] shrink-0 flex-col rounded-2xl border border-white/80 bg-[#f7f7f8] p-3 shadow-sm transition-colors duration-200",
        isDragOver && "border-dashed border-brand-primary bg-brand-primary/5"
      )}
    >
      <div className="flex items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          {status === "DONE" ? (
            <CheckCircle2 className="size-4 fill-slate-900 text-surface" />
          ) : (
            <span
              className={cn(
                "size-3 rounded-full border border-dashed",
                statusDotClassNames[status],
              )}
            />
          )}
          <h3 className="m-0 text-sm font-extrabold text-foreground">
            {label}
          </h3>
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-[#edf1f7] text-[11px] font-extrabold text-muted">
            {tasks.length}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onAddTaskClick(status)}
            className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-foreground"
            title={`Add task to ${label}`}
          >
            <Plus className="size-4" />
          </button>
          <span
            className="flex size-7 items-center justify-center rounded-lg text-muted"
            aria-hidden="true"
          >
            <MoreHorizontal className="size-4" />
          </span>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-0.5">
        {tasks.length === 0 ? (
          <button
            type="button"
            onClick={() => onAddTaskClick(status)}
            className="grid min-h-[132px] place-items-center rounded-2xl border border-dashed border-border/60 bg-surface/35 px-4 py-8 text-center transition-colors hover:border-brand-secondary/40 hover:bg-surface/70"
          >
            <span className="grid gap-2">
              <CheckCircle2 className="mx-auto size-6 text-border" />
              <span className="text-sm font-bold text-muted">
                No tasks in stage
              </span>
              <span className="text-xs font-extrabold text-brand-primary">
                + Create a task
              </span>
            </span>
          </button>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(Number(task.id))}
              onDragStart={onDragStart}
            />
          ))
        )}
      </div>
    </div>
  );
}
