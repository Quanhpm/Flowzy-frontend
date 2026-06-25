import { FormEvent, useState } from "react";
import { cn } from "@/shared/lib";
import {
  Button,
  LoadingState,
  TextInput,
  Select,
} from "@/shared/components";
import type { TaskPriority, EntityId } from "@/shared/types";
import {
  useTask,
  useTaskComments,
  useTaskActivities,
  useGroupDetails,
} from "../hooks";
import {
  useUpdateTask,
  useReplaceTaskAssignees,
  useArchiveTask,
  useAddChecklistItem,
  useUpdateChecklistItem,
  useDeleteChecklistItem,
  useAddTaskComment,
  useDeleteTaskComment,
} from "../hooks/use-task-mutations";
import {
  X,
  Plus,
  Trash2,
  CheckSquare,
  MessageSquare,
  History,
  Archive,
  UserPlus,
} from "lucide-react";

type TaskDetailPanelProps = {
  groupId: EntityId;
  taskId: EntityId;
  onClose: () => void;
};

export function TaskDetailPanel({ groupId, taskId, onClose }: TaskDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<"comments" | "activities">("comments");
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [newCommentContent, setNewCommentContent] = useState("");
  
  // Comments pagination
  const [commentsPage, setCommentsPage] = useState(0);
  const [activitiesPage, setActivitiesPage] = useState(0);

  // Queries
  const { data: taskResponse, isLoading: isTaskLoading, error: taskError } = useTask(groupId, taskId);
  const { data: commentsResponse } = useTaskComments(groupId, taskId, { page: commentsPage, size: 10 });
  const { data: activitiesResponse } = useTaskActivities(groupId, taskId, { page: activitiesPage, size: 10 });
  const { data: groupResponse } = useGroupDetails(groupId);

  // Mutations
  const updateTaskMutation = useUpdateTask(groupId, taskId);
  const replaceAssigneesMutation = useReplaceTaskAssignees(groupId, taskId);
  const archiveTaskMutation = useArchiveTask(groupId, taskId);
  const addChecklistItemMutation = useAddChecklistItem(groupId, taskId);
  const updateChecklistItemMutation = useUpdateChecklistItem(groupId, taskId);
  const deleteChecklistItemMutation = useDeleteChecklistItem(groupId, taskId);
  const addTaskCommentMutation = useAddTaskComment(groupId, taskId);
  const deleteTaskCommentMutation = useDeleteTaskComment(groupId, taskId);

  const task = taskResponse?.data;
  const group = groupResponse?.data;
  const comments = commentsResponse?.data;
  const activities = activitiesResponse?.data;

  // Local state for editing fields
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [isEditingTitleDesc, setIsEditingTitleDesc] = useState(false);

  const handleStartEdit = () => {
    if (task) {
      setEditTitle(task.title);
      setEditDesc(task.description || "");
      setIsEditingTitleDesc(true);
    }
  };

  const handleSaveTitleDesc = (e: FormEvent) => {
    e.preventDefault();
    if (!task) return;
    updateTaskMutation.mutate(
      {
        title: editTitle,
        description: editDesc || undefined,
        version: task.version,
      },
      {
        onSuccess: () => setIsEditingTitleDesc(false),
      }
    );
  };

  const handlePriorityChange = (val: string) => {
    if (!task) return;
    updateTaskMutation.mutate({
      priority: val as TaskPriority,
      version: task.version,
    });
  };

  const handleDateChange = (val: string) => {
    if (!task) return;
    if (!val) {
      updateTaskMutation.mutate({
        clearDueAt: true,
        version: task.version,
      });
    } else {
      updateTaskMutation.mutate({
        dueAt: new Date(val).toISOString(),
        version: task.version,
      });
    }
  };

  const handleAssigneeToggle = (studentId: EntityId) => {
    if (!task) return;
    const currentAssigneeIds = task.assignees.map((a) => Number(a.studentId));
    const targetStudentId = Number(studentId);
    
    let newAssigneeIds: number[];
    if (currentAssigneeIds.includes(targetStudentId)) {
      newAssigneeIds = currentAssigneeIds.filter((id) => id !== targetStudentId);
    } else {
      newAssigneeIds = [...currentAssigneeIds, targetStudentId];
    }

    replaceAssigneesMutation.mutate({
      assigneeStudentIds: newAssigneeIds,
      version: task.version,
    });
  };

  const handleAddChecklist = (e: FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    addChecklistItemMutation.mutate(
      { title: newChecklistTitle.trim() },
      {
        onSuccess: () => setNewChecklistTitle(""),
      }
    );
  };

  const handleChecklistToggle = (itemId: EntityId, completed: boolean) => {
    updateChecklistItemMutation.mutate({
      itemId,
      payload: { completed: !completed },
    });
  };

  const handleChecklistDelete = (itemId: EntityId) => {
    deleteChecklistItemMutation.mutate(itemId);
  };

  const handleAddComment = (e: FormEvent) => {
    e.preventDefault();
    if (!newCommentContent.trim()) return;
    addTaskCommentMutation.mutate(
      { content: newCommentContent.trim() },
      {
        onSuccess: () => setNewCommentContent(""),
      }
    );
  };

  const handleArchive = () => {
    if (window.confirm("Are you sure you want to archive this task?")) {
      archiveTaskMutation.mutate(undefined, {
        onSuccess: () => onClose(),
      });
    }
  };

  // Convert ISO date string to datetime-local value
  const toLocalDatetime = (isoStr: string | null) => {
    if (!isoStr) return "";
    const date = new Date(isoStr);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
      date.getDate()
    )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const formatFullDate = (isoStr: string | null) => {
    if (!isoStr) return "N/A";
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(isoStr));
  };

  if (isTaskLoading) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-[520px] max-w-full border-l border-border bg-surface p-6 shadow-2xl">
        <LoadingState title="Loading task details..." />
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className="fixed inset-y-0 right-0 z-40 w-[520px] max-w-full border-l border-border bg-surface p-6 shadow-2xl flex flex-col items-center justify-center">
        <div className="text-red-500 font-bold mb-4">Error loading task details.</div>
        <Button onClick={onClose}>Close panel</Button>
      </div>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-35 bg-[rgba(26,26,26,0.36)] transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-40 flex w-[520px] max-w-full flex-col border-l border-border bg-surface shadow-2xl animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex size-5 items-center justify-center rounded bg-brand-primary/10 text-[10px] font-bold text-brand-primary">
              ID
            </span>
            <span className="text-xs font-mono text-muted">#{task.id}</span>
            <span className="text-xs text-muted-foreground/40 font-mono">v{task.version}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              onClick={handleArchive}
              className="h-8 border-red-200 text-red-600 hover:bg-red-50 px-2 rounded-lg"
              title="Archive task"
            >
              <Archive className="size-4 mr-1" />
              <span className="text-xs font-semibold">Archive</span>
            </Button>
            <Button
              variant="secondary"
              onClick={onClose}
              className="size-8 p-0 rounded-lg"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description Section */}
          {!isEditingTitleDesc ? (
            <div
              className="group rounded-xl border border-transparent p-2.5 -m-2.5 hover:bg-neutral-50/50 hover:border-border cursor-pointer transition-all"
              onClick={handleStartEdit}
            >
              <h2 className="m-0 text-xl font-bold text-foreground group-hover:text-brand-primary">
                {task.title}
              </h2>
              <div className="mt-2 text-sm text-muted leading-relaxed whitespace-pre-wrap">
                {task.description || (
                  <span className="text-muted-foreground/50 italic">No description provided. Click to add.</span>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveTitleDesc} className="space-y-4">
              <TextInput
                label="Task Title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
                className="w-full font-bold"
              />
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Description
                </label>
                <textarea
                  className="w-full rounded-xl border border-border bg-surface p-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary outline-none min-h-[90px]"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Describe details of this task..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm">
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditingTitleDesc(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border p-4 bg-surface-base">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Priority
              </label>
              <Select
                value={task.priority}
                onChange={(e) => handlePriorityChange(e.target.value)}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </Select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Due Date
              </label>
              <input
                type="datetime-local"
                value={toLocalDatetime(task.dueAt)}
                onChange={(e) => handleDateChange(e.target.value)}
                className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
              />
            </div>
          </div>

          {/* Assignees Section */}
          <div>
            <h3 className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <UserPlus className="size-4" />
              <span>Assignees</span>
            </h3>
            {group?.members && group.members.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {group.members.map((member) => {
                  const isAssigned = task.assignees.some(
                    (a) => Number(a.studentId) === Number(member.studentId)
                  );
                  return (
                    <button
                      key={member.studentId}
                      type="button"
                      onClick={() => handleAssigneeToggle(member.studentId)}
                      className={cn(
                        "inline-flex h-8 items-center gap-2 rounded-full border px-3 text-xs font-medium transition-all",
                        isAssigned
                          ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                          : "border-border bg-surface text-muted hover:border-brand-secondary/40"
                      )}
                    >
                      <div
                        className={cn(
                          "size-2.5 rounded-full",
                          isAssigned ? "bg-brand-primary" : "bg-neutral-300"
                        )}
                      />
                      <span>{member.fullName}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground/60 italic">Loading members list...</div>
            )}
          </div>

          {/* Checklist Section */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground m-0">
                <CheckSquare className="size-4" />
                <span>Checklist</span>
              </h3>
              <span className="text-xs font-semibold text-brand-primary">
                {task.checklistCompletedCount}/{task.checklistCount} ({task.checklistProgressPercent}%)
              </span>
            </div>

            {/* Checklist Progress Bar */}
            <div className="h-1.5 w-full rounded-full bg-border overflow-hidden mb-4">
              <div
                className="h-full bg-brand-primary transition-all duration-300"
                style={{ width: `${task.checklistProgressPercent}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2 mb-3">
              {task.checklistItems && task.checklistItems.length > 0 ? (
                task.checklistItems.map((item) => (
                  <div
                    key={item.id}
                    className="group/item flex items-center justify-between gap-3 rounded-xl border border-border/40 hover:border-border bg-surface p-3 transition-all"
                  >
                    <label className="flex flex-1 items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleChecklistToggle(item.id, item.completed)}
                        className="size-4.5 accent-brand-primary rounded"
                      />
                      <span
                        className={cn(
                          "text-sm font-medium transition-all leading-normal",
                          item.completed
                            ? "text-muted-foreground/60 line-through"
                            : "text-foreground"
                        )}
                      >
                        {item.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleChecklistDelete(item.id)}
                      className="size-7 flex items-center justify-center text-muted-foreground/50 hover:text-red-600 rounded-lg hover:bg-red-50 p-0 border border-transparent transition-all opacity-0 group-hover/item:opacity-100"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-xs text-muted-foreground/50 border border-dashed border-border rounded-xl">
                  No checklist items.
                </div>
              )}
            </div>

            {/* Add Checklist Item Form */}
            <form onSubmit={handleAddChecklist} className="flex gap-2">
              <TextInput
                value={newChecklistTitle}
                onChange={(e) => setNewChecklistTitle(e.target.value)}
                placeholder="Add item..."
                className="flex-1"
              />
              <Button type="submit" size="md">
                <Plus className="size-4" />
              </Button>
            </form>
          </div>

          {/* Tabs for Comments & Activities */}
          <div className="border-t border-border pt-6">
            <div className="flex gap-1.5 border-b border-border pb-3">
              <button
                type="button"
                onClick={() => setActiveTab("comments")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg border",
                  activeTab === "comments"
                    ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                    : "border-transparent text-muted hover:bg-neutral-50"
                )}
              >
                <MessageSquare className="size-3.5" />
                Comments
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("activities")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all rounded-lg border",
                  activeTab === "activities"
                    ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                    : "border-transparent text-muted hover:bg-neutral-50"
                )}
              >
                <History className="size-3.5" />
                History
              </button>
            </div>

            {/* Tab content */}
            <div className="mt-4 min-h-[150px]">
              {activeTab === "comments" ? (
                <div className="space-y-4">
                  {/* Add comment */}
                  <form onSubmit={handleAddComment} className="flex flex-col gap-2 bg-neutral-50/50 border border-border p-3 rounded-2xl">
                    <textarea
                      value={newCommentContent}
                      onChange={(e) => setNewCommentContent(e.target.value)}
                      placeholder="Write a comment..."
                      className="w-full bg-transparent border-0 resize-none text-sm outline-none min-h-[50px] leading-relaxed"
                      required
                    />
                    <div className="flex justify-end pt-2 border-t border-border/40">
                      <Button type="submit" size="sm">
                        Send Comment
                      </Button>
                    </div>
                  </form>

                  {/* List comments */}
                  <div className="space-y-3 mt-4">
                    {comments?.content && comments.content.length > 0 ? (
                      comments.content.map((comment) => (
                        <div
                          key={comment.id}
                          className="flex flex-col gap-1.5 border border-border/55 p-3 rounded-2xl bg-surface"
                        >
                          <div className="flex items-center justify-between text-xs text-muted">
                            <span className="font-bold text-foreground">
                              {comment.authorFullName}
                            </span>
                            <div className="flex items-center gap-2">
                              <span>{formatFullDate(comment.createdAt)}</span>
                              <button
                                type="button"
                                onClick={() => deleteTaskCommentMutation.mutate(comment.id)}
                                className="text-red-500 hover:underline hover:text-red-700"
                                title="Delete comment"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <p className="m-0 text-sm leading-relaxed text-muted font-medium break-words">
                            {comment.content}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-muted-foreground/50">
                        No comments yet.
                      </div>
                    )}

                    {/* Pagination */}
                    {comments && comments.totalPages > 1 && (
                      <div className="flex items-center justify-between pt-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={comments.page === 0}
                          onClick={() => setCommentsPage(comments.page - 1)}
                        >
                          Previous
                        </Button>
                        <span className="text-xs text-muted">
                          Page {comments.page + 1} of {comments.totalPages}
                        </span>
                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={comments.page >= comments.totalPages - 1}
                          onClick={() => setCommentsPage(comments.page + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* List activities */}
                  <div className="relative border-l border-border/80 pl-4.5 ml-2 space-y-5 py-2">
                    {activities?.content && activities.content.length > 0 ? (
                      activities.content.map((act) => (
                        <div key={act.id} className="relative text-xs">
                          {/* Dot marker */}
                          <div className="absolute -left-[24.5px] top-1 size-2 rounded-full bg-brand-primary border border-surface shadow-sm" />
                          <div className="flex items-center gap-1.5 text-muted-foreground/60 mb-0.5">
                            <span className="font-bold text-muted">{act.actor.fullName}</span>
                            <span>•</span>
                            <span>{formatFullDate(act.createdAt)}</span>
                          </div>
                          <div className="text-muted leading-relaxed font-semibold">
                            {act.activityType.replace(/_/g, " ")}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-xs text-muted-foreground/50 border-l-0 -ml-4.5">
                        No history available.
                      </div>
                    )}
                  </div>

                  {/* Pagination */}
                  {activities && activities.totalPages > 1 && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={activities.page === 0}
                        onClick={() => setActivitiesPage(activities.page - 1)}
                      >
                        Previous
                      </Button>
                      <span className="text-xs text-muted">
                        Page {activities.page + 1} of {activities.totalPages}
                      </span>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={activities.page >= activities.totalPages - 1}
                        onClick={() => setActivitiesPage(activities.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
