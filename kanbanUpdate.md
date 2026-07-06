# Kế hoạch Cập nhật Kanban Board (`kanbanUpdate.md`)

Tài liệu này tổng hợp chi tiết kế hoạch nâng cấp cho Kanban Board. Các tính năng đang hoạt động tốt được **giữ nguyên**, chỉ cập nhật phần quản lý Checkpoints / Outcomes động theo mã môn học (`courseCode`) và tích hợp cụm API Task Boards.

---

## 1. Các Tính năng GIỮ NGUYÊN (Không thay đổi)

Các phần đang chạy ổn định trong `src/modules/projects/components/kanban-board.tsx` sẽ được bảo toàn nguyên vẹn:
*   ✅ **Cấu trúc 5 Cột Kanban**: `Backlog`, `To Do`, `In Progress`, `In Review`, `Done`.
*   ✅ **Kéo thả & Chuyển trạng thái**: Drag & drop giữa các cột (`handleDragStart`, `handleTaskMove`, `useMoveTask`).
*   **Thanh lọc & Tìm kiếm (Filter Bar)**: Tìm kiếm theo tên task (`searchFilter`), lọc theo Assignee (`assigneeFilter`), lọc theo Priority (`priorityFilter`), và bật/tắt task đã lưu trữ (`includeArchived`).
*   ✅ **Chế độ xem đa dạng (Board Views)**: `Board`, `List`, `Timeline`, `Due Tasks`.
*   ✅ **Các Modal & Panel phụ**: `TaskDetailPanel` (xem chi tiết task), Modal tạo task mới (`handleCreateTask`, `useCreateTask`).
*   ✅ **Thống kê công việc**: Hiển thị tổng số active tasks và overdue tasks.

---

## 2. Các Tính năng CẦN CẬP NHẬT (Update Specifications)

### 2.1 Hiển thị mốc Động theo `courseCode` (Dynamic Milestones)
Thay thế `const checkpoints = [1, 2, 3]` cứng bằng logic tự động nhận diện theo `group.courseCode`:

*   **Nếu `courseCode` chứa `101` (ví dụ: `EXE101`)**:
    *   Nhãn hiển thị: **`CHECKPOINTS`**
    *   Số lượng: **4 Checkpoints** (`Checkpoint 1`, `Checkpoint 2`, `Checkpoint 3`, `Checkpoint 4`)
    *   Màu sắc chấm trạng thái:
        *   Checkpoint 1: `bg-emerald-400`
        *   Checkpoint 2: `bg-indigo-500`
        *   Checkpoint 3: `bg-amber-500`
        *   Checkpoint 4: `bg-purple-500`

*   **Nếu `courseCode` chứa `201` hoặc `202` (ví dụ: `EXE201`, `EXE202`)**:
    *   Nhãn hiển thị: **`OUTCOMES`**
    *   Số lượng: **3 Outcomes** (`Outcome 1`, `Outcome 2`, `Outcome 3`)
    *   Màu sắc chấm trạng thái:
        *   Outcome 1: `bg-emerald-400`
        *   Outcome 2: `bg-indigo-500`
        *   Outcome 3: `bg-amber-500`

### 2.2 Nút Thêm Board Tùy chỉnh (`+`)
*   Thêm nút `[ ➕ Board ]` ngay cuối danh sách các tab Checkpoints/Outcomes.
*   Khi bấm vào, cho phép tạo Board mới tùy chỉnh cho nhóm (gọi API `POST /api/groups/{groupId}/boards`).

---

## 3. Mã Nguồn Cập Nhật Chi Tiết (`src/modules/projects/components/kanban-board.tsx`)

```tsx
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
  // Queries
  const { data: groupResponse } = useGroupDetails(groupId);
  const group = groupResponse?.data;

  // Xử lý Checkpoints / Outcomes động theo courseCode
  const courseCode = group?.courseCode ?? "EXE101";

  const { milestoneLabel, milestones } = useMemo(() => {
    const isExe101 = courseCode.toUpperCase().includes("101");
    if (isExe101) {
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
    return {
      milestoneLabel: "OUTCOMES",
      milestones: [
        { id: "oc1", label: "Outcome 1", tone: "bg-emerald-400" },
        { id: "oc2", label: "Outcome 2", tone: "bg-indigo-500" },
        { id: "oc3", label: "Outcome 3", tone: "bg-amber-500" },
      ],
    };
  }, [courseCode]);

  const [activeMilestoneId, setActiveMilestoneId] = useState<string>("cp1");
  const [activeView, setActiveView] = useState<BoardView>("board");

  // Filters state (GIỮ NGUYÊN)
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [includeArchived, setIncludeArchived] = useState<boolean>(false);

  // Selected Task Detail panel state (GIỮ NGUYÊN)
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  // Add Task Modal state (GIỮ NGUYÊN)
  const [addTaskStatus, setAddTaskStatus] = useState<TaskStatus | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPriority, setNewPriority] = useState<TaskPriority>("MEDIUM");
  const [newDueAt, setNewDueAt] = useState("");
  const [newAssignees, setNewAssignees] = useState<number[]>([]);

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

  const board = boardResponse?.data;
  const allTasks = useMemo(
    () => board?.columns.flatMap((column) => column.tasks) ?? [],
    [board],
  );

  // Mutations (GIỮ NGUYÊN)
  const createTaskMutation = useCreateTask(groupId);
  const moveTaskMutation = useMoveTask(groupId);

  // ... (tất cả handlers handleDragStart, handleTaskMove, handleCreateTask giữ nguyên) ...

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-[#e8eaee] shadow-sm">
      {/* Header bar chứa Checkpoints / Outcomes */}
      <div className="border-b border-border bg-surface px-4 py-4 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <span className="mr-1 text-xs font-extrabold tracking-[0.22em] text-muted uppercase">
              {milestoneLabel}
            </span>
            {milestones.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setActiveMilestoneId(m.id)}
                className={cn(
                  "inline-flex h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition-[background,border-color,color,box-shadow]",
                  activeMilestoneId === m.id
                    ? "border-brand-secondary/30 bg-[#eef2ff] text-brand-primary shadow-sm"
                    : "border-border bg-surface text-muted hover:border-brand-secondary/30 hover:text-foreground",
                )}
              >
                <span className={cn("size-2 rounded-full", m.tone)} />
                {m.label}
              </button>
            ))}
            {/* Nút Tạo Board tùy chỉnh mới */}
            <button
              type="button"
              title="Thêm Board mới"
              className="inline-flex h-9 items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-surface px-3 text-xs font-bold text-muted transition-colors hover:border-brand-primary hover:text-brand-primary"
            >
              <Plus className="size-3.5" />
              <span>Board</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-muted">
              <Circle className="size-2 fill-emerald-400 text-emerald-400" />
              <span>{board?.activeTaskCount ?? 0} active</span>
              <span className="text-border">/</span>
              <span className={cn((board?.overdueTaskCount ?? 0) > 0 && "text-red-600")}>
                {board?.overdueTaskCount ?? 0} overdue
              </span>
            </div>
            <Button onClick={() => setAddTaskStatus("TODO")} size="sm">
              <Plus className="size-4" />
              New Task
            </Button>
          </div>
        </div>
      </div>

      {/* Phần còn lại của Filter Bar, View Controls và Render Column giữ nguyên 100% */}
    </div>
  );
}
```

---

## 4. Kế hoạch Kiểm thử & Xác minh

1. **Khóa học EXE101**: Nhóm thuộc EXE101 sẽ tự động hiện nhãn `CHECKPOINTS` với 4 nút Checkpoint 1 -> 4.
2. **Khóa học EXE201 / EXE202**: Nhóm thuộc EXE201/202 sẽ tự động hiện nhãn `OUTCOMES` với 3 nút Outcome 1 -> 3.
3. **Các tính năng khác**: Kiểm tra kéo thả công việc, tìm kiếm, lọc theo thành viên và mở panel chi tiết công việc vẫn hoạt động bình thường.
