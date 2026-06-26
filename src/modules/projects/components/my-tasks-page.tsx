"use client";

import { useState, useMemo, useEffect } from "react";
import { cn } from "@/shared/lib";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  EmptyState,
  LoadingState,
  PageHeader,
  Select,
} from "@/shared/components";
import type { TaskStatus, TaskPriority } from "@/shared/types";
import { useMyTasks, useMyGroups } from "../hooks";
import { KanbanBoard } from "./kanban-board";
import { TaskStatusBadge } from "./task-status-badge";
import { TaskPriorityBadge } from "./task-priority-badge";
import { TaskDetailPanel } from "./task-detail-panel";
import { ChevronRight, ListTodo, Kanban } from "lucide-react";

export function StudentTasksPage() {
  const [activeTab, setActiveTab] = useState<"list" | "board">("list");
  
  // My Tasks list filters
  const [listStatus, setListStatus] = useState<string>("");
  const [listPriority, setListPriority] = useState<string>("");
  const [listOverdue, setListOverdue] = useState<boolean>(false);
  const [listPage, setListPage] = useState(0);

  // Group selection for Kanban board
  const [selectedGroupId, setSelectedGroupId] = useState<string>("");

  // Detail panel state
  const [detailTaskId, setDetailTaskId] = useState<number | null>(null);
  const [detailGroupId, setDetailGroupId] = useState<number | null>(null);

  // Queries
  const myTasksFilters = {
    status: listStatus ? (listStatus as TaskStatus) : undefined,
    priority: listPriority ? (listPriority as TaskPriority) : undefined,
    overdue: listOverdue ? true : undefined,
    page: listPage,
    size: 10,
  };

  const { data: myTasksResponse, isLoading: isTasksLoading, refetch: refetchMyTasks } = useMyTasks(myTasksFilters);
  const { data: myGroupsResponse, isLoading: isGroupsLoading } = useMyGroups();

  const myTasks = myTasksResponse?.data;
  const myGroups = useMemo(() => myGroupsResponse?.data || [], [myGroupsResponse?.data]);

  // Find active group or set default
  const activeGroup = useMemo(() => {
    if (myGroups.length === 0) return null;
    const active = myGroups.find((g) => g.status === "ACTIVE");
    return active || myGroups[0];
  }, [myGroups]);

  // Set initial selected group ID for board view
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (activeGroup && !selectedGroupId) {
      setSelectedGroupId(String(activeGroup.id));
    }
  }, [activeGroup, selectedGroupId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Refetch list when tab switches to "list"
  useEffect(() => {
    if (activeTab === "list") {
      refetchMyTasks();
    }
  }, [activeTab, refetchMyTasks]);

  const handleRowClick = (taskId: number, taskGroupId: number | null) => {
    // If taskGroupId is not returned, we fallback to the selected group or student's active group
    const finalGroupId = taskGroupId || (activeGroup ? Number(activeGroup.id) : null);
    if (finalGroupId) {
      setDetailTaskId(taskId);
      setDetailGroupId(finalGroupId);
    } else {
      alert("Cannot open task detail because task is not associated with a valid group.");
    }
  };

  const formatShortDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div className="grid min-w-0 gap-6">
      {/* Page Title & Tab Toggles */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <PageHeader
          title="Tasks & Kanban Board"
          description="Manage your assigned tasks and view your group project board."
        />

        {/* Tab triggers */}
        <div className="flex items-center gap-1 bg-surface-base border border-border p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-lg",
              activeTab === "list"
                ? "bg-surface shadow-sm text-brand-primary"
                : "text-muted hover:bg-surface/50"
            )}
          >
            <ListTodo className="size-4" />
            My Task List
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("board")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all rounded-lg",
              activeTab === "board"
                ? "bg-surface shadow-sm text-brand-primary"
                : "text-muted hover:bg-surface/50"
            )}
          >
            <Kanban className="size-4" />
            Group Kanban Board
          </button>
        </div>
      </div>

      {/* Tab content area */}
      {activeTab === "list" ? (
        <Card className="shadow-sm">
          <CardHeader
            title="Assigned Tasks"
            description="List of all tasks assigned to you. Select filters below to search."
          />
          
          <CardContent className="space-y-6">
            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 items-end gap-3 rounded-2xl border border-border p-4 bg-surface-base">
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Task Status
                </label>
                <Select
                  value={listStatus}
                  onChange={(e) => {
                    setListStatus(e.target.value);
                    setListPage(0);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="BACKLOG">Backlog</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="REVIEW">Review</option>
                  <option value="DONE">Done</option>
                </Select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Task Priority
                </label>
                <Select
                  value={listPriority}
                  onChange={(e) => {
                    setListPriority(e.target.value);
                    setListPage(0);
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </Select>
              </div>

              <div className="flex h-10 items-center justify-between gap-3 border border-border px-3 rounded-xl bg-surface">
                <span className="text-xs font-bold text-muted uppercase tracking-wider">Overdue Only</span>
                <input
                  type="checkbox"
                  checked={listOverdue}
                  onChange={(e) => {
                    setListOverdue(e.target.checked);
                    setListPage(0);
                  }}
                  className="size-4.5 accent-brand-primary rounded"
                />
              </div>
            </div>

            {/* List Body */}
            {isTasksLoading ? (
              <LoadingState title="Loading your tasks..." />
            ) : myTasks?.content && myTasks.content.length > 0 ? (
              <div className="space-y-4">
                <div className="w-full overflow-x-auto rounded-xl border border-border">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border bg-surface-base">
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Task
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Status
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Priority
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Due Date
                        </th>
                        <th className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface [&_tr:hover]:bg-neutral-50/50">
                      {myTasks.content.map((task) => (
                        <tr
                          key={task.id}
                          className="group cursor-pointer transition-colors"
                          onClick={() => handleRowClick(Number(task.id), null)}
                        >
                          <td className="px-5 py-4">
                            <div className="font-bold text-foreground group-hover:text-brand-primary transition-colors">
                              {task.title}
                            </div>
                            {task.description && (
                              <div className="mt-1 text-xs text-muted-foreground/60 line-clamp-1 max-w-[300px]">
                                {task.description}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <TaskStatusBadge status={task.status} />
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <TaskPriorityBadge priority={task.priority} />
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-xs font-semibold text-muted">
                            <span className={cn(task.overdue && "text-red-600 font-bold")}>
                              {formatShortDate(task.dueAt)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <ChevronRight className="inline-block size-4.5 text-muted transition-transform group-hover:translate-x-0.5" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {myTasks.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <span className="text-xs text-muted">
                      Showing page {myTasks.page + 1} of {myTasks.totalPages} ({myTasks.totalElements} tasks)
                    </span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={myTasks.page === 0}
                        onClick={() => setListPage(myTasks.page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={myTasks.page >= myTasks.totalPages - 1}
                        onClick={() => setListPage(myTasks.page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <EmptyState
                title="No tasks assigned to you"
                description="Hooray! You don't have any pending tasks assigned to you at the moment."
              />
            )}
          </CardContent>
        </Card>
      ) : (
        /* Board view */
        <div className="space-y-6 min-w-0 w-full overflow-hidden">
          {/* Group Project Selector */}
          {myGroups.length > 1 && (
            <div className="flex items-center gap-3 w-fit border border-border p-3.5 rounded-2xl bg-surface shadow-sm">
              <span className="text-sm font-bold text-muted whitespace-nowrap">Select Group Project:</span>
              <Select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="min-w-[280px]"
              >
                {myGroups.map((g) => (
                  <option key={g.id} value={String(g.id)}>
                    {g.groupNo} - {g.name} ({g.projectName || "No Project"})
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Render Board */}
          {selectedGroupId ? (
            <KanbanBoard groupId={Number(selectedGroupId)} />
          ) : isGroupsLoading ? (
            <LoadingState title="Loading your group info..." />
          ) : (
            <EmptyState
              title="You are not part of any group project yet"
              description="To view the task board, please make sure you have created or joined a group project first."
            />
          )}
        </div>
      )}

      {/* Task Details Side Panel (shared for both list & board) */}
      {detailTaskId !== null && detailGroupId !== null && (
        <TaskDetailPanel
          groupId={detailGroupId}
          taskId={detailTaskId}
          onClose={() => {
            setDetailTaskId(null);
            setDetailGroupId(null);
          }}
        />
      )}
    </div>
  );
}
