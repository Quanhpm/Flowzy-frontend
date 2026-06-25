import { useState } from "react";
import { cn } from "@/shared/lib";
import type { TaskStatus } from "@/shared/types";
import type { TaskSummaryDto } from "../types";
import { TaskCard } from "./task-card";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components";

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

  // Status visual configurations
  const statusColorMap: Record<TaskStatus, string> = {
    BACKLOG: "border-t-neutral-400 bg-neutral-50/50",
    TODO: "border-t-brand-primary bg-orange-50/10",
    IN_PROGRESS: "border-t-yellow-500 bg-yellow-50/10",
    REVIEW: "border-t-indigo-500 bg-indigo-50/10",
    DONE: "border-t-green-500 bg-green-50/10",
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex h-full min-h-[500px] w-72 shrink-0 flex-col rounded-2xl border-t-[4px] border-x border-b border-border bg-surface p-3.5 shadow-sm transition-colors duration-200",
        statusColorMap[status],
        isDragOver && "border-dashed border-brand-primary bg-brand-primary/5"
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3.5">
        <div className="flex items-center gap-2">
          <h3 className="m-0 text-sm font-bold text-foreground">
            {label}
          </h3>
          <span className="inline-flex size-5 items-center justify-center rounded-full bg-border text-xs font-bold text-muted-foreground">
            {tasks.length}
          </span>
        </div>
        
        {/* Quick Add Button */}
        <Button
          onClick={() => onAddTaskClick(status)}
          variant="secondary"
          className="size-7 p-0 rounded-lg"
          title={`Add task to ${label}`}
        >
          <Plus className="size-4" />
        </Button>
      </div>

      {/* Cards List */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto min-h-0 pr-0.5">
        {tasks.length === 0 ? (
          <div className="flex flex-1 items-center justify-center py-10 text-center border-2 border-dashed border-border/55 rounded-xl">
            <span className="text-xs text-muted">No tasks here</span>
          </div>
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
