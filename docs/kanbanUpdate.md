# Kế hoạch Triển khai API cho Task Boards

Kế hoạch này chi tiết hóa việc tích hợp cụm API **Task Boards** lấy trực tiếp từ Swagger Specification (`https://api-fspark.kusl.io.vn/v3/api-docs`). Cụm API này phục vụ việc quản lý các bảng công việc (task boards) trong một nhóm sinh viên.

---

## 1. Danh sách Endpoints (Task Boards)

| Method | Endpoint Primary | Alias Endpoint | Phân quyền (Roles) | Mô tả |
|---|---|---|---|---|
| **GET** | `/api/groups/{groupId}/boards` | `/api/groups/{groupId}/task-boards` | `STUDENT` (thành viên nhóm), `MENTOR` (được chỉ định) | Lấy danh sách tất cả task boards của nhóm |
| **POST** | `/api/groups/{groupId}/boards` | `/api/groups/{groupId}/task-boards` | `STUDENT` (Group Leader), `ADMIN` | Tạo task board mới cho nhóm |
| **PATCH** | `/api/groups/{groupId}/boards/{boardId}` | `/api/groups/{groupId}/task-boards/{boardId}` | `STUDENT` (Group Leader), `ADMIN` | Cập nhật thông tin/trạng thái task board |

> **Lưu ý:** Backend hỗ trợ 2 đường dẫn song song (`/boards` và `/task-boards`). Chuẩn hóa codebase sẽ ưu tiên dùng đường dẫn chính `/api/groups/{groupId}/boards`.

---

## 2. Chi tiết Endpoints & Schemas

### 2.1 Get Task Boards
*   **Method**: `GET`
*   **Path**: `/api/groups/{groupId}/boards`
*   **Path Parameters**:
    *   `groupId` (integer, int64, required): ID của nhóm sinh viên.
*   **Response**: `ApiResponse<TaskBoardDto[]>`

```json
{
  "code": 200,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "groupId": 10,
      "name": "Sprint 1 Board",
      "description": "Board cho giai đoạn 1",
      "position": 1,
      "defaultBoard": true,
      "createdByStudentId": 101,
      "archivedAt": null,
      "createdAt": "2026-07-04T10:00:00Z",
      "updatedAt": "2026-07-04T10:00:00Z"
    }
  ]
}
```

---

### 2.2 Create Task Board
*   **Method**: `POST`
*   **Path**: `/api/groups/{groupId}/boards`
*   **Path Parameters**:
    *   `groupId` (integer, int64, required): ID của nhóm sinh viên.
*   **Request Body**: `CreateTaskBoardRequest`
    ```typescript
    type CreateTaskBoardRequest = {
      name: string;        // Max length 255, required
      description?: string;
    };
    ```
*   **Response**: `ApiResponse<TaskBoardDto>`

---

### 2.3 Update Task Board
*   **Method**: `PATCH`
*   **Path**: `/api/groups/{groupId}/boards/{boardId}`
*   **Path Parameters**:
    *   `groupId` (integer, int64, required): ID của nhóm sinh viên.
    *   `boardId` (integer, int64, required): ID của task board cần cập nhật.
*   **Request Body**: `UpdateTaskBoardRequest`
    ```typescript
    type UpdateTaskBoardRequest = {
      name?: string;
      description?: string;
      position?: number;      // Thứ tự sắp xếp board
      archived?: boolean;      // Đánh dấu lưu trữ board
      defaultBoard?: boolean;  // Đặt làm board mặc định
    };
    ```
*   **Response**: `ApiResponse<TaskBoardDto>`

---

## 3. Khai báo Types & DTOs (`src/modules/projects/types/boards.types.ts`)

```typescript
import type { ISODateTimeString } from "@/shared/types";

export type TaskBoardDto = {
  id: number;
  groupId: number;
  name: string;
  description: string | null;
  position: number;
  defaultBoard: boolean;
  createdByStudentId: number;
  archivedAt: ISODateTimeString | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type CreateTaskBoardRequest = {
  name: string;
  description?: string;
};

export type UpdateTaskBoardRequest = {
  name?: string;
  description?: string;
  position?: number;
  archived?: boolean;
  defaultBoard?: boolean;
};
```

---

## 4. Triển khai API Functions (`src/modules/projects/api/boards.api.ts`)

```typescript
import { apiGet, apiPatch, apiPost } from "@/shared/lib";
import type { ApiResponse } from "@/shared/types";
import type {
  CreateTaskBoardRequest,
  TaskBoardDto,
  UpdateTaskBoardRequest,
} from "../types";

export function getTaskBoards(groupId: number) {
  return apiGet<ApiResponse<TaskBoardDto[]>>(
    `/api/groups/${groupId}/boards`
  );
}

export function createTaskBoard(groupId: number, payload: CreateTaskBoardRequest) {
  return apiPost<ApiResponse<TaskBoardDto>>(
    `/api/groups/${groupId}/boards`,
    payload
  );
}

export function updateTaskBoard(
  groupId: number,
  boardId: number,
  payload: UpdateTaskBoardRequest
) {
  return apiPatch<ApiResponse<TaskBoardDto>>(
    `/api/groups/${groupId}/boards/${boardId}`,
    payload
  );
}
```

---

## 5. Bổ sung Query Keys & TanStack Query Hooks

### 5.1 Query Keys (`src/shared/lib/query-keys.ts`)
```typescript
tasks: {
  all: ["tasks"] as const,
  boards: (groupId: number) => ["groups", groupId, "boards"] as const,
  boardDetail: (groupId: number, boardId: number) => ["groups", groupId, "boards", boardId] as const,
  // ... existing keys
}
```

### 5.2 Custom Hooks (`src/modules/projects/hooks/use-task-boards.ts`)

```typescript
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib/query-keys";
import { createTaskBoard, getTaskBoards, updateTaskBoard } from "../api/boards.api";
import type { CreateTaskBoardRequest, UpdateTaskBoardRequest } from "../types";

// Query lấy danh sách Boards
export function useTaskBoards(groupId: number | null | undefined) {
  return useQuery({
    queryKey: queryKeys.tasks.boards(groupId!),
    queryFn: () => getTaskBoards(groupId!),
    enabled: typeof groupId === "number",
  });
}

// Mutation tạo Board mới
export function useCreateTaskBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ groupId, payload }: { groupId: number; payload: CreateTaskBoardRequest }) =>
      createTaskBoard(groupId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.boards(variables.groupId) });
    },
  });
}

// Mutation cập nhật Board
export function useUpdateTaskBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      groupId,
      boardId,
      payload,
    }: {
      groupId: number;
      boardId: number;
      payload: UpdateTaskBoardRequest;
    }) => updateTaskBoard(groupId, boardId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.boards(variables.groupId) });
    },
  });
}
```

---

## 6. Kế hoạch Tích hợp UI Component

1. **Board Switcher Header**: Cho phép sinh viên/mentor bấm chuyển đổi giữa các boards của nhóm (`useTaskBoards`).
2. **Modal Create Board**: Cho phép Leader tạo board mới (`useCreateTaskBoard`).
3. **Board Settings Menu**: Cho phép sửa tên, đặt mặc định hoặc Archive board (`useUpdateTaskBoard`).
Theo trải nghiệm người dùng (UX) và đặc thù ứng dụng quản lý dự án sinh viên như F-Spark (các môn như EXE101/EXE201), phương án Tối ưu nhất (Hybrid) là:

👉 Tạo sẵn khung Checkpoint 1, 2, 3 (Default Presets) + Cho phép bấm "+" để tạo thêm nếu muốn.

💡 Tại sao lại nên TẠO SẴN Checkpoint 1, 2, 3?
Chuẩn hóa theo Khung môn học (Curriculum Alignment):

Môn học (EXE101 / EXE201) luôn có các mốc đánh giá cố định (vd: Checkpoint 1: Bài toán & Khách hàng, Checkpoint 2: Giải pháp & MVP, Checkpoint 3: Pitching & Báo cáo).
Nếu để trống hoàn toàn bắt sinh viên tự gõ tạo board từ đầu, sinh viên thường bối rối không biết tạo tên gì cho đúng chuẩn môn học.
Giảm ma sát người dùng (Zero Onboarding Friction):

Nhóm mới thành lập vào trang Task Board là thấy ngay lộ trình Checkpoint 1, 2, 3 để bắt tay vào làm việc ngay lập tức.
🎨 Thiết kế UX Flow chuẩn & Đẹp mắt:


┌────────────────────────────────────────────────────────────────────────┐
│ CHECKPOINTS   [🟢 Checkpoint 1]  [🔵 Checkpoint 2]  [⚪ Checkpoint 3]  [ ➕ ]│
└────────────────────────────────────────────────────────────────────────┘
1. Trạng thái của các nút Checkpoint:
Active (Đã tạo / Đang làm): Viền sáng brand-primary, chấm xanh bg-emerald-400. Khi click vào -> Chuyển sang Task Board của Checkpoint đó.
Pending / Chưa tạo: Chấm xám/nét đứt. Khi click vào -> Tự động gọi API POST /api/groups/{groupId}/boards khởi tạo Board cho Checkpoint đó và active ngay.
2. Thêm nút [ ➕ ] ở góc phải:
Để linh hoạt cho nhóm muốn tạo thêm các Board phụ (vd: Backlog chung, Sprint phụ, Kế hoạch Marketing).
🚀 Gợi ý cách triển khai Code logic
Khi nhóm chưa có Board nào:
FE có thể tự động fetch danh sách Milestones từ /api/groups/{groupId}/milestones (hoặc tạo 3 Boards mặc định: Checkpoint 1, Checkpoint 2, Checkpoint 3 khi nhóm bấm vào lần đầu).
Tích hợp với API Task Boards mới:
Khi bấm vào tab Checkpoint chưa tạo: Gọi createTaskBoard(groupId, { name: "Checkpoint X" }).