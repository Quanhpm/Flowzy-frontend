import { FormEvent, useState } from "react";
import {
  Button,
  EmptyState,
  LoadingState,
  TextInput,
  Select,
} from "@/shared/components";
import type { TaskPriority, TaskStatus, EntityId } from "@/shared/types";
import { useGroupBoard, useGroupDetails } from "../hooks";
import { useCreateTask, useMoveTask } from "../hooks/use-task-mutations";
import { KanbanColumn } from "./kanban-column";
import { TaskDetailPanel } from "./task-detail-panel";
import { Plus, Search, X } from "lucide-react";

type KanbanBoardProps = {
  groupId: EntityId;
};

export function KanbanBoard({ groupId }: KanbanBoardProps) {
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

  const { data: boardResponse, isLoading: isBoardLoading, error: boardError } = useGroupBoard(groupId, boardFilters);
  const { data: groupResponse } = useGroupDetails(groupId);
  
  const board = boardResponse?.data;
  const group = groupResponse?.data;

  // Mutations
  const createTaskMutation = useCreateTask(groupId);
  const moveTaskMutation = useMoveTask(groupId);

  // Drag start helper
  const handleDragStart = (e: React.DragEvent, taskId: number, currentStatus: string) => {
    e.dataTransfer.setData("text/plain", taskId.toString());
    e.dataTransfer.setData("application/x-task-status", currentStatus);
  };

  // Find task and trigger move task
  const handleTaskMove = (taskId: number, targetStatus: TaskStatus, position: number) => {
    if (!board) return;
    
    // Find task in the current board list to get its version
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
        assigneeStudentIds: newAssignees.length > 0 ? newAssignees : undefined,
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
      }
    );
  };

  const handleAssigneeCheckboxChange = (studentId: number, checked: boolean) => {
    if (checked) {
      setNewAssignees([...newAssignees, studentId]);
    } else {
      setNewAssignees(newAssignees.filter((id) => id !== studentId));
    }
  };

  // Status mapping for visual columns
  const columnsConfig: { status: TaskStatus; label: string }[] = [
    { status: "BACKLOG", label: "Backlog" },
    { status: "TODO", label: "To Do" },
    { status: "IN_PROGRESS", label: "In Progress" },
    { status: "REVIEW", label: "Review" },
    { status: "DONE", label: "Done" },
  ];

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

  // Get active tasks list by column
  const getTasksByStatus = (status: TaskStatus) => {
    const col = board.columns.find((c) => c.status === status);
    return col ? col.tasks : [];
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Board Summary Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border p-4 bg-surface shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Active Tasks</span>
            <div className="text-2xl font-extrabold text-foreground mt-0.5">{board.activeTaskCount}</div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Overdue Tasks</span>
            <div className="text-2xl font-extrabold text-red-600 mt-0.5">{board.overdueTaskCount}</div>
          </div>
        </div>

        <Button onClick={() => setAddTaskStatus("TODO")} size="md">
          <Plus className="size-4 mr-1.5" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Toolbar filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 items-end gap-3 rounded-2xl border border-border p-4 bg-surface shadow-sm">
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Search Tasks
          </label>
          <div className="relative">
            <TextInput
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Filter by title..."
              className="w-full pl-9"
            />
            <Search className="absolute left-3 top-3 size-4 text-muted" />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Filter Assignee
          </label>
          <Select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
          >
            <option value="">All Assignees</option>
            {(group?.members || []).map((m) => (
              <option key={m.studentId} value={String(m.studentId)}>
                {m.fullName}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Filter Priority
          </label>
          <Select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
        </div>

        <div className="flex h-10 items-center justify-between gap-3 border border-border px-3 rounded-xl">
          <span className="text-xs font-bold text-muted uppercase tracking-wider">Include Archived</span>
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => setIncludeArchived(e.target.checked)}
            className="size-4.5 accent-brand-primary rounded"
          />
        </div>
      </div>

      {/* Kanban columns viewport */}
      <div className="flex w-full max-w-full gap-4 overflow-x-auto pb-4 min-h-[500px]">
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

      {/* Task Details Side Panel */}
      {selectedTaskId !== null && (
        <TaskDetailPanel
          groupId={groupId}
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
        />
      )}

      {/* Add Task Modal */}
      {addTaskStatus !== null && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-[rgba(26,26,26,0.36)] p-6">
          <div className="grid w-[min(540px,100%)] max-h-[90vh] grid-rows-[auto_1fr_auto] overflow-hidden rounded-2xl border border-border bg-surface shadow-modal">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h3 className="m-0 text-lg font-bold text-foreground">
                Add Task to {columnsConfig.find(c => c.status === addTaskStatus)?.label}
              </h3>
              <Button
                variant="secondary"
                onClick={() => setAddTaskStatus(null)}
                className="size-8 p-0 rounded-lg"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateTask} className="flex-1 overflow-y-auto p-6 space-y-4">
              <TextInput
                label="Task Title"
                placeholder="What needs to be done?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Task details, instructions, etc."
                  className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Priority
                  </label>
                  <Select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newDueAt}
                    onChange={(e) => setNewDueAt(e.target.value)}
                    className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>

              {/* Assignees checkbox list */}
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Assign Task
                </label>
                {group?.members && group.members.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2 border border-border rounded-xl p-3 bg-neutral-50/50">
                    {group.members.map((member) => (
                      <label key={member.studentId} className="flex items-center gap-2 text-xs font-medium cursor-pointer py-1">
                        <input
                          type="checkbox"
                          checked={newAssignees.includes(Number(member.studentId))}
                          onChange={(e) => handleAssigneeCheckboxChange(Number(member.studentId), e.target.checked)}
                          className="size-4 accent-brand-primary rounded"
                        />
                        <span className="truncate">{member.fullName}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground/60 italic">Loading group members...</div>
                )}
              </div>

              {/* Modal Footer (Inside Form) */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-border mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setAddTaskStatus(null)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Create Task
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
