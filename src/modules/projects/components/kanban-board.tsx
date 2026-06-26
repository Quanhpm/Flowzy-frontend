import { FormEvent, useMemo, useState } from "react";
import {
  Button,
  EmptyState,
  LoadingState,
  TextInput,
  Select,
} from "@/shared/components";
import { cn } from "@/shared/lib";
import type { TaskPriority, TaskStatus, EntityId } from "@/shared/types";
import { useGroupBoard, useGroupDetails } from "../hooks";
import { useCreateTask, useMoveTask } from "../hooks/use-task-mutations";
import { KanbanColumn } from "./kanban-column";
import { TaskDetailPanel } from "./task-detail-panel";
import {
  TaskBoardListView,
  TaskDueTasksView,
  TaskTimelineView,
} from "./task-board-views";
import { Circle, Plus, Search, X } from "lucide-react";

type KanbanBoardProps = {
  groupId: EntityId;
};

type BoardView = "board" | "list" | "timeline" | "dueTasks";

const checkpoints = [1, 2, 3] as const;

const boardViews: { id: BoardView; label: string }[] = [
  { id: "board", label: "Board" },
  { id: "list", label: "List" },
  { id: "timeline", label: "Timeline" },
  { id: "dueTasks", label: "Due Tasks" },
];

const columnsConfig: { status: TaskStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "REVIEW", label: "In Review" },
  { status: "DONE", label: "Done" },
];

export function KanbanBoard({ groupId }: KanbanBoardProps) {
  const [activeCheckpoint, setActiveCheckpoint] = useState(1);
  const [activeView, setActiveView] = useState<BoardView>("board");

  // Filters state
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);

  // Selected Task Detail panel state
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Add Task Modal state
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("MEDIUM");
  const [newDueAt, setNewDueAt] = useState("");
  const [newAssignees, setNewAssignees] = useState<number[]>([]);

  // Queries
  const boardFilters = {
    priority: priorityFilter ? (priorityFilter as TaskPriority) : undefined,
    assigneeStudentId: assigneeFilter ? Number(assigneeFilter) : undefined,
    search: searchFilter || undefined,
    includeArchived,
  };

  const {
    data: boardResponse,
    isLoading: isBoardLoading,
    error: boardError,
  } = useGroupBoard(groupId, boardFilters);
  const { data: groupResponse } = useGroupDetails(groupId);

  const board = boardResponse?.data;
  const group = groupResponse?.data;
  const allTasks = useMemo(
    () => board?.columns.flatMap((column) => column.tasks) ?? [],
    [board],
  );

  // Mutations
  const createTaskMutation = useCreateTask(groupId);
  const moveTaskMutation = useMoveTask(groupId);

  const handleDragStart = (
    e: React.DragEvent,
    taskId: number,
    currentStatus: string,
  ) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
    e.dataTransfer.setData("application/x-task-status", currentStatus);
  };

  const handleTaskMove = (
    taskId: number,
    targetStatus: TaskStatus,
    position: number,
  ) => {
    if (!board) return;

    let sourceTask = null;
    for (const col of board.columns) {
      const t = col.tasks.find((task) => Number(task.id) === taskId);
      if (t) {
        sourceTask = t;
        break;
      }
    }

    if (!sourceTask) return;

    moveTaskMutation.mutate({
      taskId,
      payload: {
        status: targetStatus,
        position,
        version: sourceTask.version,
      },
    });
  };

  const handleCreateTask = (e: FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !addTaskStatus) return;

    createTaskMutation.mutate(
      {
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        status: addTaskStatus,
        priority: newPriority,
        dueAt: newDueAt ? new Date(newDueAt).toISOString() : null,
        assigneeStudentIds:
          newAssignees.length > 0 ? newAssignees : undefined,
      },
      {
        onSuccess: () => {
          setAddTaskStatus(null);
          setNewTitle("");
          setNewDesc("");
          setNewPriority("MEDIUM");
          setNewDueAt("");
          setNewAssignees([]);
        },
      },
    );
  };

  const handleAssigneeCheckboxChange = (
    studentId: number,
    checked: boolean,
  ) => {
    if (checked) {
      setNewAssignees([...newAssignees, studentId]);
    } else {
      setNewAssignees(newAssignees.filter((id) => id !== studentId));
    }
  };

  const getTasksByStatus = (status: TaskStatus) => {
    const col = board?.columns.find((c) => c.status === status);
    return col ? col.tasks : [];
  };

  const renderActiveView = () => {
    if (activeView === "list") {
      return (
        <TaskBoardListView
          tasks={allTasks}
          onTaskClick={(id) => setSelectedTaskId(id)}
        />
      );
    }

    if (activeView === "timeline") {
      return (
        <TaskTimelineView
          tasks={allTasks}
          onTaskClick={(id) => setSelectedTaskId(id)}
        />
      );
    }

    if (activeView === "dueTasks") {
      return (
        <TaskDueTasksView
          tasks={allTasks}
          onTaskClick={(id) => setSelectedTaskId(id)}
        />
      );
    }

    return (
      <div className="flex w-full max-w-full gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {columnsConfig.map((col) => (
          <KanbanColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={getTasksByStatus(col.status)}
            onTaskClick={(id) => setSelectedTaskId(id)}
            onAddTaskClick={(status) => setAddTaskStatus(status)}
            onTaskMove={handleTaskMove}
            onDragStart={handleDragStart}
          />
        ))}
      </div>
    );
  };

  if (isBoardLoading) {
    return <LoadingState title="Loading task board..." />;
  }

  if (boardError || !board) {
    return (
      <EmptyState
        title="Could not load Kanban Board"
        description="Please verify that your group is active and has a project set up."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[#e8eaee] shadow-sm">
      <div className="border-b border-border bg-surface px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <span className="mr-1 text-xs font-extrabold tracking-[0.22em] text-muted uppercase">
              Checkpoints
            </span>
            {checkpoints.map((checkpoint) => (
              <button
                key={checkpoint}
                type="button"
                onClick={() => setActiveCheckpoint(checkpoint)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-[background,border-color,color,box-shadow]",
                  activeCheckpoint === checkpoint
                    ? "border-brand-secondary/30 bg-[#eef2ff] text-brand-primary shadow-sm"
                    : "border-border bg-surface text-muted hover:border-brand-secondary/30 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "size-2 rounded-full",
                    checkpoint === 1 && "bg-emerald-400",
                    checkpoint === 2 && "bg-indigo-500",
                    checkpoint === 3 && "bg-slate-300",
                  )}
                />
                Checkpoint {checkpoint}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <Circle className="size-2 fill-emerald-400 text-emerald-400" />
              <span>{board.activeTaskCount} active</span>
              <span className="text-border">/</span>
              <span className={cn(board.overdueTaskCount > 0 && "text-red-600")}>
                {board.overdueTaskCount} overdue
              </span>
            </div>
            <Button onClick={() => setAddTaskStatus("TODO")} size="sm">
              <Plus className="size-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-surface px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex max-w-full overflow-x-auto rounded-xl border border-border bg-surface-base p-1">
            {boardViews.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id)}
                className={cn(
                  "h-8 shrink-0 rounded-lg px-4 text-xs font-bold text-muted transition-[background,color,box-shadow]",
                  activeView === view.id
                    ? "bg-surface text-foreground shadow-sm"
                    : "hover:text-foreground",
                )}
              >
                {view.label}
              </button>
            ))}
          </div>

          <div className="flex min-w-0 flex-wrap items-center gap-2 max-[640px]:w-full">
            <TextInput
              icon={<Search className="size-4" />}
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search tasks"
              fieldClassName="w-[210px] max-[640px]:w-full"
              shellClassName="h-9 rounded-full px-3"
              className="text-xs"
            />
            <Select
              value={assigneeFilter}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              fieldClassName="w-[150px] max-[640px]:w-full"
              shellClassName="h-9 rounded-full"
              className="text-xs"
            >
              <option value="">Assignees</option>
              {(group?.members || []).map((m) => (
                <option key={m.studentId} value={String(m.studentId)}>
                  {m.fullName}
                </option>
              ))}
            </Select>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              fieldClassName="w-[130px] max-[640px]:w-full"
              shellClassName="h-9 rounded-full"
              className="text-xs"
            >
              <option value="">Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
            <label className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-3 text-xs font-bold text-muted max-[640px]:w-full">
              <input
                type="checkbox"
                checked={includeArchived}
                onChange={(e) => setIncludeArchived(e.target.checked)}
                className="size-3.5 accent-brand-primary"
              />
              Archived
            </label>
          </div>
        </div>
      </div>

      <div className="min-h-[560px] bg-[#e8eaee] p-4 sm:p-5">
        {renderActiveView()}
      </div>

      {selectedTaskId !== null && (
        <TaskDetailPanel
          groupId={groupId}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {addTaskStatus !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6">
          <div className="grid max-h-[90vh] w-[min(540px,100%)] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="m-0 text-lg font-bold text-foreground">
                Add Task to{" "}
                {columnsConfig.find((c) => c.status === addTaskStatus)?.label}
              </h3>
              <Button
                variant="secondary"
                onClick={() => setAddTaskStatus(null)}
                className="size-8 rounded-lg p-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form
              onSubmit={handleCreateTask}
              className="flex-1 space-y-4 overflow-y-auto p-6"
            >
              <TextInput
                label="Task Title"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task details, instructions, etc."
                  className="min-h-[80px] w-full rounded-xl border border-border bg-surface p-3 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 max-[560px]:grid-cols-1">
                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Priority
                  </label>
                  <Select
                    value={newPriority}
                    onChange={(e) =>
                      setNewPriority(e.target.value as TaskPriority)
                    }
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newDueAt}
                    onChange={(e) => setNewDueAt(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold tracking-wider text-muted-foreground uppercase">
                  Assign Task
                </label>
                {group?.members && group.members.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 rounded-xl border border-border bg-neutral-50/50 p-3 max-[560px]:grid-cols-1">
                    {group.members.map((member) => (
                      <label
                        key={member.studentId}
                        className="flex cursor-pointer items-center gap-2 py-1 text-xs font-medium"
                      >
                        <input
                          type="checkbox"
                          checked={newAssignees.includes(
                            Number(member.studentId),
                          )}
                          onChange={(e) =>
                            handleAssigneeCheckboxChange(
                              Number(member.studentId),
                              e.target.checked,
                            )
                          }
                          className="size-4 rounded accent-brand-primary"
                        />
                        <span className="truncate">{member.fullName}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground/60 italic">
                    Loading group members...
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-2.5 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddTaskStatus(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Task</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
