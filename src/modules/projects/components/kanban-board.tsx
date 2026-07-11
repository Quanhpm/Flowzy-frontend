import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  DateTimeInput,
  EmptyState,
  LoadingState,
  TextInput,
  Select,
} from "@/shared/components";
import { cn } from "@/shared/lib";
import type { TaskPriority, TaskStatus, EntityId } from "@/shared/types";
import { useCreateTaskBoard, useGroupBoard, useGroupDetails, useTaskBoards } from "../hooks";
import { useCreateTask, useReorderTask } from "../hooks/use-task-mutations";
import type { TaskBoardDto } from "../types";
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

type MilestonePreset = {
  id: string;
  label: string;
  tone: string;
};

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

function normalizeBoardName(name: string) {
  return name.trim().toLowerCase();
}

function getMilestonesForCourse(courseCode: string): {
  milestoneLabel: string;
  milestones: MilestonePreset[];
} {
  const normalizedCourseCode = courseCode.toUpperCase();
  const isOutcomeCourse = normalizedCourseCode.includes("201");

  if (isOutcomeCourse) {
    return {
      milestoneLabel: "OUTCOMES",
      milestones: [
        { id: "oc1", label: "Outcome 1", tone: "bg-emerald-400" },
        { id: "oc2", label: "Outcome 2", tone: "bg-indigo-500" },
        { id: "oc3", label: "Outcome 3", tone: "bg-amber-500" },
      ],
    };
  }

  return {
    milestoneLabel: "CHECKPOINTS",
    milestones: [
      { id: "cp1", label: "Checkpoint 1", tone: "bg-emerald-400" },
      { id: "cp2", label: "Checkpoint 2", tone: "bg-indigo-500" },
      { id: "cp3", label: "Checkpoint 3", tone: "bg-amber-500" },
      { id: "cp4", label: "Checkpoint 4", tone: "bg-purple-500" },
    ],
  };
}

export function KanbanBoard({ groupId }: KanbanBoardProps) {
  const [activeBoardId, setActiveBoardId] = useState<EntityId | null>(null);
  const [activeBoardName, setActiveBoardName] = useState("");
  const [activeView, setActiveView] = useState<BoardView>("board");
  const [isCreateBoardOpen, setIsCreateBoardOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");
  const [newBoardDescription, setNewBoardDescription] = useState("");
  const [boardActionError, setBoardActionError] = useState("");

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
  const {
    data: groupResponse,
    error: groupError,
    isLoading: isGroupLoading,
  } = useGroupDetails(groupId);
  const {
    data: taskBoardsResponse,
    error: taskBoardsError,
    isLoading: isTaskBoardsLoading,
  } = useTaskBoards(groupId);

  const group = groupResponse?.data;
  const taskBoards = useMemo(
    () => taskBoardsResponse?.data.filter((taskBoard) => !taskBoard.archivedAt) ?? [],
    [taskBoardsResponse?.data],
  );
  const courseCode = group?.courseCode ?? "EXE101";
  const { milestoneLabel, milestones } = useMemo(
    () => getMilestonesForCourse(courseCode),
    [courseCode],
  );
  const milestoneNameSet = useMemo(
    () => new Set(milestones.map((milestone) => normalizeBoardName(milestone.label))),
    [milestones],
  );
  const boardsByName = useMemo(() => {
    return new Map(
      taskBoards.map((taskBoard) => [normalizeBoardName(taskBoard.name), taskBoard]),
    );
  }, [taskBoards]);
  const customBoards = useMemo(
    () =>
      taskBoards.filter(
        (taskBoard) => !milestoneNameSet.has(normalizeBoardName(taskBoard.name)),
      ),
    [milestoneNameSet, taskBoards],
  );
  const defaultTaskBoard = useMemo(
    () => taskBoards.find((taskBoard) => taskBoard.defaultBoard) ?? taskBoards[0] ?? null,
    [taskBoards],
  );
  const activeTaskBoard = useMemo(() => {
    if (activeBoardId !== null) {
      const selectedBoard = taskBoards.find(
        (taskBoard) => Number(taskBoard.id) === Number(activeBoardId),
      );

      if (selectedBoard) {
        return selectedBoard;
      }
    }

    if (activeBoardName) {
      const namedBoard = boardsByName.get(normalizeBoardName(activeBoardName));

      if (namedBoard) {
        return namedBoard;
      }
    }

    for (const milestone of milestones) {
      const milestoneBoard = boardsByName.get(normalizeBoardName(milestone.label));

      if (milestoneBoard) {
        return milestoneBoard;
      }
    }

    return defaultTaskBoard;
  }, [activeBoardId, activeBoardName, boardsByName, defaultTaskBoard, milestones, taskBoards]);
  const activeTaskBoardId = activeTaskBoard?.id ?? activeBoardId ?? undefined;
  const currentActiveBoardName =
    activeTaskBoard?.name || activeBoardName || milestones[0]?.label || "Checkpoint 1";
  const boardFilters = useMemo(
    () => ({
      boardId: activeTaskBoardId,
      priority: priorityFilter ? (priorityFilter as TaskPriority) : undefined,
      assigneeStudentId: assigneeFilter ? Number(assigneeFilter) : undefined,
      search: searchFilter || undefined,
      includeArchived,
    }),
    [activeTaskBoardId, assigneeFilter, includeArchived, priorityFilter, searchFilter],
  );
  const createTaskBoardMutation = useCreateTaskBoard();
  const {
    data: boardResponse,
    isLoading: isBoardLoading,
    error: boardError,
  } = useGroupBoard(groupId, boardFilters, activeTaskBoardId !== undefined);

  const board = boardResponse?.data;
  const allTasks = useMemo(
    () => board?.columns.flatMap((column) => column.tasks) ?? [],
    [board],
  );

  // Mutations
  const createTaskMutation = useCreateTask(groupId);
  const reorderTaskMutation = useReorderTask(groupId);
  const initialBoardCreationRef = useRef(new Set<string>());

  useEffect(() => {
    const firstMilestone = milestones[0];
    const hasLoadedGroup = Boolean(groupResponse?.data);
    const hasLoadedBoards = Boolean(taskBoardsResponse);

    if (!firstMilestone || !hasLoadedGroup || !hasLoadedBoards) return;

    const existingBoard = boardsByName.get(
      normalizeBoardName(firstMilestone.label),
    );
    if (existingBoard) return;

    const creationKey = `${groupId}:${firstMilestone.label}`;
    if (initialBoardCreationRef.current.has(creationKey)) return;

    initialBoardCreationRef.current.add(creationKey);
    createTaskBoardMutation.mutate(
      {
        groupId,
        payload: { name: firstMilestone.label },
      },
      {
        onError: (error) => {
          setBoardActionError(
            error instanceof Error
              ? error.message
              : `Could not create ${firstMilestone.label}.`,
          );
        },
        onSuccess: (response) => {
          setActiveBoardId(response.data.id);
          setActiveBoardName(response.data.name);
          setSelectedTaskId(null);
        },
      },
    );
  }, [
    boardsByName,
    createTaskBoardMutation,
    groupId,
    groupResponse?.data,
    milestones,
    taskBoardsResponse,
  ]);

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

    reorderTaskMutation.mutate({
      taskId,
      targetStatus,
      targetIndex: position,
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
        boardId: activeTaskBoardId,
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

  const handlePresetBoardClick = async (milestone: MilestonePreset) => {
    setBoardActionError("");

    const existingBoard = boardsByName.get(normalizeBoardName(milestone.label));
    if (existingBoard) {
      setActiveBoardId(existingBoard.id);
      setActiveBoardName(existingBoard.name);
      setSelectedTaskId(null);
      return;
    }

    try {
      const response = await createTaskBoardMutation.mutateAsync({
        groupId,
        payload: { name: milestone.label },
      });
      setActiveBoardId(response.data.id);
      setActiveBoardName(response.data.name);
      setSelectedTaskId(null);
    } catch (error) {
      setBoardActionError(
        error instanceof Error
          ? error.message
          : "Could not create this task board.",
      );
    }
  };

  const handleCustomBoardClick = (taskBoard: TaskBoardDto) => {
    setBoardActionError("");
    setActiveBoardId(taskBoard.id);
    setActiveBoardName(taskBoard.name);
    setSelectedTaskId(null);
  };

  const handleCreateCustomBoard = async (event: FormEvent) => {
    event.preventDefault();
    setBoardActionError("");

    if (!newBoardName.trim()) {
      setBoardActionError("Board name is required.");
      return;
    }

    try {
      const response = await createTaskBoardMutation.mutateAsync({
        groupId,
        payload: {
          description: newBoardDescription.trim() || undefined,
          name: newBoardName.trim(),
        },
      });
      setActiveBoardId(response.data.id);
      setActiveBoardName(response.data.name);
      setSelectedTaskId(null);
      setIsCreateBoardOpen(false);
      setNewBoardName("");
      setNewBoardDescription("");
    } catch (error) {
      setBoardActionError(
        error instanceof Error ? error.message : "Could not create board.",
      );
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

  if (
    isGroupLoading ||
    isTaskBoardsLoading ||
    isBoardLoading ||
    (activeTaskBoardId === undefined &&
      !boardActionError &&
      !groupError &&
      !taskBoardsError)
  ) {
    return <LoadingState title="Loading task board..." />;
  }

  if (groupError || taskBoardsError || boardError || !board) {
    return (
      <EmptyState
        title="Could not load Kanban Board"
        description={
          boardActionError ||
          "Please verify that your group is active and has a project set up."
        }
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[#e8eaee] shadow-sm">
      <div className="border-b border-border bg-surface px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <span className="mr-1 text-xs font-extrabold tracking-[0.22em] text-muted uppercase">
              {milestoneLabel}
            </span>
            {milestones.map((milestone) => {
              const existingBoard = boardsByName.get(
                normalizeBoardName(milestone.label),
              );
              const isCreated = Boolean(existingBoard);
              const isActive = existingBoard
                ? Number(activeTaskBoardId) === Number(existingBoard.id)
                : normalizeBoardName(currentActiveBoardName) ===
                    normalizeBoardName(milestone.label);

              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => handlePresetBoardClick(milestone)}
                  disabled={createTaskBoardMutation.isPending}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-[background,border-color,color,box-shadow]",
                    isActive
                      ? "border-brand-secondary/30 bg-[#eef2ff] text-brand-primary shadow-sm"
                      : isCreated
                        ? "border-border bg-surface text-muted hover:border-brand-secondary/30 hover:text-foreground"
                        : "border-dashed border-border bg-surface text-muted hover:border-brand-primary hover:text-brand-primary",
                  )}
                  title={isCreated ? "Open board" : "Create board"}
                >
                  <span
                    className={cn(
                      "size-2 rounded-full",
                      isCreated ? milestone.tone : "bg-slate-300",
                    )}
                  />
                  {milestone.label}
                </button>
              );
            })}
            {customBoards.map((taskBoard) => {
              const isActive =
                Number(activeTaskBoardId) === Number(taskBoard.id);

              return (
                <button
                  key={taskBoard.id}
                  type="button"
                  onClick={() => handleCustomBoardClick(taskBoard)}
                  className={cn(
                    "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-[background,border-color,color,box-shadow]",
                    isActive
                      ? "border-brand-secondary/30 bg-[#eef2ff] text-brand-primary shadow-sm"
                      : "border-border bg-surface text-muted hover:border-brand-secondary/30 hover:text-foreground",
                  )}
                >
                  <span className="size-2 rounded-full bg-brand-primary" />
                  {taskBoard.name}
                </button>
              );
            })}
            <button
              type="button"
              title="Add board"
              onClick={() => {
                setBoardActionError("");
                setIsCreateBoardOpen(true);
              }}
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface px-3 text-xs font-bold text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              <Plus className="size-3.5" />
              <span>Board</span>
            </button>
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
        {boardActionError && (
          <p className="mt-3 mb-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {boardActionError}
          </p>
        )}
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
                  <DateTimeInput
                    value={newDueAt}
                    onChange={(e) => setNewDueAt(e.target.value)}
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

      {isCreateBoardOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6">
          <div className="grid max-h-[90vh] w-[min(520px,100%)] grid-rows-[auto_1fr] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="m-0 text-lg font-bold text-foreground">
                  Create board
                </h3>
                <p className="mt-1 mb-0 text-sm text-muted">
                  Add a custom task board for this group.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setIsCreateBoardOpen(false);
                  setNewBoardName("");
                  setNewBoardDescription("");
                }}
                className="size-8 rounded-lg p-0"
              >
                <X className="size-4" />
              </Button>
            </div>

            <form
              onSubmit={handleCreateCustomBoard}
              className="space-y-4 overflow-y-auto p-6"
            >
              <TextInput
                label="Board name"
                onChange={(event) => setNewBoardName(event.target.value)}
                placeholder="Sprint planning, Marketing, Research..."
                value={newBoardName}
                required
              />
              <TextInput
                label="Description"
                onChange={(event) =>
                  setNewBoardDescription(event.target.value)
                }
                placeholder="Optional context for this board"
                value={newBoardDescription}
              />
              <div className="flex justify-end gap-2.5 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsCreateBoardOpen(false);
                    setNewBoardName("");
                    setNewBoardDescription("");
                  }}
                >
                  Cancel
                </Button>
                <Button
                  disabled={createTaskBoardMutation.isPending}
                  type="submit"
                >
                  {createTaskBoardMutation.isPending
                    ? "Creating..."
                    : "Create board"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
