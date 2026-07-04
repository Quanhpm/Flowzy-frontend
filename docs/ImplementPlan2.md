# Groups Nâng Cao + Dashboard Groups/Mentor

Hoàn thiện tính năng Groups nâng cao (Join Requests, Leave, Ungrouped Students) và xây dựng Dashboard cho Student/Mentor. Tất cả endpoints đã được xác minh từ Swagger API (`/v3/api-docs`).

## User Review Required

> [!IMPORTANT]
> **Thay đổi shared file `query-keys.ts` và `enums.ts`**: Cần bổ sung query keys cho join-requests, ungrouped students, dashboard. Và thêm enum `JoinRequestStatus`. Đây là protected files (Person 1 owns) — theo ImplementPlan.md hiện tại, Person 2 **đã được phép** sửa query keys.

> [!WARNING]
> **File `student-groups-page.tsx` hiện đã 1,452 dòng** — rất lớn. Plan này sẽ refactor tách thành sub-components riêng thay vì tiếp tục nhồi thêm code vào file monolith.

## Proposed Changes

Thứ tự triển khai: **Types → API → Hooks → Components → Routes**

---

### Phase 1: Shared Infrastructure Updates

#### [MODIFY] [enums.ts](file:///e:/Documents/F-spark-frontend/src/shared/types/enums.ts)

Thêm enum mới:

```ts
export type JoinRequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED";
```

#### [MODIFY] [query-keys.ts](file:///e:/Documents/F-spark-frontend/src/shared/lib/query-keys.ts)

Thêm keys cho join-requests, ungrouped students, và dashboard:

```ts
groups: {
  // ... existing keys ...
  joinRequests: (groupId: number) =>
    [...queryKeys.groups.all, groupId, "join-requests"] as const,
  myJoinRequests: () =>
    [...queryKeys.groups.all, "join-requests", "me"] as const,
},
students: {
  all: ["students"] as const,
  ungrouped: (filters?: QueryFilters) =>
    ["students", "ungrouped", filters ?? {}] as const,
},
dashboard: {
  all: ["dashboard"] as const,
  studentGroups: () => ["dashboard", "student", "groups"] as const,
  studentProjects: () => ["dashboard", "student", "projects"] as const,
  studentProgress: () => ["dashboard", "student", "progress"] as const,
  mentorGroups: () => ["dashboard", "mentor", "groups"] as const,
  mentorMeetings: () => ["dashboard", "mentor", "meetings"] as const,
},
```

---

### Phase 2: Groups Module — Join Requests Data Layer

#### [MODIFY] [index.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/types/index.ts) (types)

Thêm types mới từ Swagger schemas:

```ts
// ── Join Request DTOs ──────────────────────────
export type GroupJoinRequestDto = {
  id: number;
  groupId: number;
  groupName: string;
  groupNo: string;
  courseCode: string;
  term: string;
  studentId: number;
  studentCode: string;
  studentName: string;
  status: JoinRequestStatus;  // "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELED"
  message: string | null;
  respondedById: number | null;
  respondedByCode: string | null;
  respondedByName: string | null;
  respondedAt: ISODateTimeString | null;
  createdAt: ISODateTimeString;
  updatedAt: ISODateTimeString;
};

export type CreateJoinRequestDto = {
  message?: string;
};
```

#### [MODIFY] [groups.api.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/api/groups.api.ts)

Thêm API functions mới (xác nhận từ Swagger):

| Function | Method | Endpoint | Description |
|---|---|---|---|
| `leaveGroupPost(groupId)` | POST | `/api/groups/{groupId}/leave` | POST-compatible leave |
| `createJoinRequest(groupId, payload)` | POST | `/api/groups/{groupId}/join-requests` | Student gửi yêu cầu join |
| `getGroupJoinRequests(groupId)` | GET | `/api/groups/{groupId}/join-requests` | Leader xem requests |
| `approveJoinRequest(groupId, requestId)` | POST | `/api/groups/{groupId}/join-requests/{requestId}/approve` | Leader approve |
| `rejectJoinRequest(groupId, requestId)` | POST | `/api/groups/{groupId}/join-requests/{requestId}/reject` | Leader reject |
| `cancelJoinRequest(groupId, requestId)` | POST | `/api/groups/{groupId}/join-requests/{requestId}/cancel` | Student cancel |

#### [NEW] [use-join-requests.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/hooks/use-join-requests.ts)

```ts
// Queries
useGroupJoinRequests(groupId)    // useQuery → getGroupJoinRequests, key: groups.joinRequests(groupId)

// Mutations
useCreateJoinRequest()           // useMutation → createJoinRequest, invalidate groups.joinRequests + groups.all
useApproveJoinRequest()          // useMutation → approveJoinRequest, invalidate groups.joinRequests + groups.detail
useRejectJoinRequest()           // useMutation → rejectJoinRequest, invalidate groups.joinRequests
useCancelJoinRequest()           // useMutation → cancelJoinRequest, invalidate groups.joinRequests
```

#### [MODIFY] [index.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/hooks/index.ts)

Thêm: `export * from "./use-join-requests"`

---

### Phase 3: Student Discovery Module (Ungrouped Students)

#### [NEW] [src/modules/groups/api/students.api.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/api/students.api.ts)

```ts
// GET /api/students/ungrouped — List ungrouped students
// Params: term (required), courseCode (required), search?, page?, size?
// Response: PageResponse<StudentProfileDto>
export function getUngroupedStudents(query: UngroupedStudentsQuery) {
  return apiGet<ApiResponse<PageResponse<StudentProfileDto>>>("/api/students/ungrouped", query);
}
```

#### [MODIFY] [index.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/types/index.ts)

```ts
export type UngroupedStudentsQuery = {
  term: string;
  courseCode: string;
  search?: string;
  page?: number;
  size?: number;
};
```

#### [NEW] [use-ungrouped-students.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/hooks/use-ungrouped-students.ts)

```ts
export function useUngroupedStudents(query: UngroupedStudentsQuery) {
  return useQuery({
    queryFn: () => getUngroupedStudents(query),
    queryKey: queryKeys.students.ungrouped(query),
    enabled: Boolean(query.term && query.courseCode),
  });
}
```

---

### Phase 4: Dashboard Module — Data Layer

#### [MODIFY] [src/modules/dashboards/index.ts](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/index.ts)

Chuyển từ module constant thành full module với api, types, hooks, components.

#### [NEW] [src/modules/dashboards/types/index.ts](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/types/index.ts)

Từ Swagger schemas:

```ts
export type DashboardStatsDto = {
  totalGroups: number;
  totalProjects: number;
  totalMentors: number;
  totalMeetings: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  progressPercent: number;
};

export type DashboardGroupProgressDto = {
  groupId: number;
  term: string;
  courseCode: string;
  groupNo: string;
  groupName: string;
  projectName: string | null;
  status: GroupStatus;
  mentorId: number | null;
  mentorCode: string | null;
  mentorName: string | null;
  memberCount: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  progressPercent: number;
  nextDueAt: ISODateTimeString | null;
  updatedAt: ISODateTimeString;
};

export type DashboardCheckpointDto = {
  taskId: number;
  groupId: number;
  groupName: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: ISODateTimeString | null;
  overdue: boolean;
};

export type DashboardStudentProgressDto = {
  stats: DashboardStatsDto;
  groups: DashboardGroupProgressDto[];
  checkpoints: DashboardCheckpointDto[];
};

export type DashboardMeetingDto = {
  id: number;
  groupId: number;
  groupName: string;
  groupNo: string;
  mentorId: number;
  mentorCode: string;
  mentorName: string;
  startAt: ISODateTimeString;
  endAt: ISODateTimeString;
  status: MeetingStatus;
};

export type DashboardProjectDto = {
  groupId: number;
  term: string;
  courseCode: string;
  groupNo: string;
  groupName: string;
  projectName: string | null;
  ideaDescription: string | null;
  researchDomain: string | null;
  groupStatus: GroupStatus;
  progressPercent: number;
};
```

#### [NEW] [src/modules/dashboards/api/dashboard.api.ts](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/api/dashboard.api.ts)

| Function | Endpoint | Response |
|---|---|---|
| `getStudentDashboardGroups()` | GET `/api/dashboard/student/groups` | `List<DashboardGroupProgressDto>` |
| `getStudentDashboardProjects()` | GET `/api/dashboard/student/projects` | `List<DashboardProjectDto>` |
| `getStudentDashboardProgress()` | GET `/api/dashboard/student/progress` | `DashboardStudentProgressDto` |
| `getMentorDashboardGroups()` | GET `/api/dashboard/mentor/groups` | `List<DashboardGroupProgressDto>` |
| `getMentorDashboardMeetings()` | GET `/api/dashboard/mentor/meetings` | `List<DashboardMeetingDto>` |

#### [NEW] [src/modules/dashboards/hooks/use-student-dashboard.ts](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/hooks/use-student-dashboard.ts)

```ts
useStudentDashboardGroups()    // queryKey: dashboard.studentGroups()
useStudentDashboardProjects()  // queryKey: dashboard.studentProjects()
useStudentDashboardProgress()  // queryKey: dashboard.studentProgress()
```

#### [NEW] [src/modules/dashboards/hooks/use-mentor-dashboard.ts](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/hooks/use-mentor-dashboard.ts)

```ts
useMentorDashboardGroups()     // queryKey: dashboard.mentorGroups()
useMentorDashboardMeetings()   // queryKey: dashboard.mentorMeetings()
```

---

### Phase 5: UI Components — Student Groups Page Refactor & Enhancements

> [!IMPORTANT]
> **Refactor strategy**: Tách `student-groups-page.tsx` (1,452 lines) thành các sub-component files riêng bên trong `src/modules/groups/components/student/`. File gốc `student-groups-page.tsx` sẽ import và orchestrate.

#### Cấu trúc thư mục mới:

```
src/modules/groups/components/
├── student/
│   ├── student-groups-page.tsx          [REWRITE] — Orchestrator (thin)
│   ├── active-group-workspace.tsx       [NEW] — Extracted from monolith
│   ├── group-card.tsx                   [NEW] — GroupSummaryDto card
│   ├── group-detail-modal.tsx           [NEW] — Read-only modal
│   ├── group-form-modal.tsx             [NEW] — Create/Edit form
│   ├── member-list.tsx                  [NEW] — Members + leader actions
│   ├── invite-student-modal.tsx         [NEW] — Invite by code/email
│   ├── invitation-list.tsx              [NEW] — Received/Sent invitations
│   ├── join-request-section.tsx         [NEW] — ⭐ Join Request UI
│   ├── ungrouped-students-section.tsx   [NEW] — ⭐ Browse ungrouped students
│   ├── meeting-booking-section.tsx      [NEW] — Mentor slots + booking
│   └── confirm-dialog.tsx              [NEW] — Generic confirm modal
├── mentor/
│   └── mentor-groups-page.tsx           [KEEP] — Minor enhancements
└── index.ts                             [MODIFY] — Update exports
```

#### Tính năng mới trên Student Groups Page:

**1. Join Request Flow (Student chưa có nhóm)**:
- Khi xem `GroupCard` → nút **"Request to Join"** trên group detail modal
- Modal confirm với trường `message` optional → gọi `useCreateJoinRequest()`
- Hiển thị trạng thái request đã gửi (PENDING badge) trên card
- Tab/section **"My Join Requests"** hiển thị danh sách requests đã gửi + nút Cancel

**2. Join Request Management (Leader đã có nhóm)**:
- Section **"Join Requests"** trong `ActiveGroupWorkspace`
- Danh sách requests PENDING với student info
- Nút **Approve** (chấp nhận student vào nhóm) / **Reject** (từ chối)
- Badge count hiển thị số requests pending

**3. Ungrouped Students (Leader đã có nhóm)**:
- Section **"Find Students"** — browse students chưa có nhóm
- Filter: term, courseCode (auto-fill từ group info), search by name/code
- Paginated table/list với student info
- Nút **"Invite"** → mở `InviteStudentModal` pre-filled

**4. Leave Group Enhancement**:
- Dùng `POST /api/groups/{groupId}/leave` (POST-compatible endpoint mới)
- Confirm dialog rõ ràng: "Bạn chắc chắn muốn rời nhóm?"
- Leader phải transfer leadership trước khi leave

#### Chi tiết UI Component — `join-request-section.tsx`:

```
┌─────────────────────────────────────────────┐
│ 📋 Join Requests                    (3 new) │
├─────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 Nguyễn Văn A — SE170123             │ │
│ │ "Mình muốn tham gia nhóm..."           │ │
│ │ ⏰ 2 hours ago     [Approve] [Reject]  │ │
│ └─────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────┐ │
│ │ 👤 Trần Thị B — SE170456               │ │
│ │ No message                              │ │
│ │ ⏰ 5 hours ago     [Approve] [Reject]  │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

#### Chi tiết UI Component — GroupCard với Join Request:

```
┌──────────────────────────────────────┐
│ 🏷️ Group Alpha          [ACTIVE ●]  │
│ SU24 • EXE101 • 3/5 members         │
│ Leader: Nguyễn Văn A                 │
│ GPA ≥ 3.0  |  Target: 8.0           │
│                                      │
│ [View Details]  [Request to Join ➡]  │
│   — or —                             │
│ [⏳ Request Pending]     [Cancel ✕]  │
└──────────────────────────────────────┘
```

---

### Phase 6: UI Components — Student Dashboard Page

#### [NEW] [src/modules/dashboards/components/student-dashboard-page.tsx](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/components/student-dashboard-page.tsx)

Layout overview:

```
PageHeader (eyebrow="Student", title="Dashboard")
├── Stats Overview Cards (4 cards dạng grid)
│   ├── 📊 Total Tasks        │ ✅ Completed
│   ├── ⚠️ Overdue            │ 📈 Progress %
├── Card: My Groups Progress
│   ├── Group cards với progress bar
│   │   ├── Group name, project, mentor
│   │   ├── Tasks: 12/20 done (60%)
│   │   ├── Progress bar (animated, brand-primary fill)
│   │   └── Next due: July 10
│   └── EmptyState nếu chưa có group
├── Card: Upcoming Checkpoints
│   ├── Task cards sắp due / overdue
│   │   ├── Task title, group, priority badge
│   │   ├── Due date (red nếu overdue)
│   │   └── Status badge
│   └── EmptyState nếu không có
└── Card: My Projects
    ├── Project info cards
    └── EmptyState
```

**Design tokens sử dụng:**
- Stats cards: `bg-surface`, `shadow-card`, border-left accent color
- Progress bar: `bg-brand-primary` fill trên `bg-background` track
- Overdue items: `Badge tone="danger"`, text `text-red-600`
- On-track items: `Badge tone="success"`

#### [MODIFY] [src/app/student/dashboard/page.tsx](file:///e:/Documents/F-spark-frontend/src/app/student/dashboard/page.tsx)

```tsx
import { StudentDashboardPage } from "@/modules/dashboards";
export default function StudentDashboardRoute() {
  return <StudentDashboardPage />;
}
```

---

### Phase 7: UI Components — Mentor Dashboard Enhancements

#### [MODIFY] [mentor-groups-page.tsx](file:///e:/Documents/F-spark-frontend/src/modules/groups/components/mentor-groups-page.tsx)

Enhancements:
- Thêm dashboard stats overview (từ `useMentorDashboardGroups()`)
- Progress bar cho mỗi group card
- Hiển thị task stats (total/completed/overdue)

#### [NEW] [src/modules/dashboards/components/mentor-dashboard-section.tsx](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/components/mentor-dashboard-section.tsx)

Mentor meetings overview widget:
- Upcoming meetings timeline (từ `useMentorDashboardMeetings()`)
- Meeting cards: group name, time, status, meet link
- Có thể embed trong mentor groups page hoặc tạo route riêng

---

### Phase 8: Availability UX Improvements

#### [MODIFY] [mentor-availability-page.tsx](file:///e:/Documents/F-spark-frontend/src/modules/mentoring/components/mentor-availability-page.tsx)

Cải thiện UX:
- **Date grouping**: Group slots theo ngày thay vì flat list
- **Visual timeline**: Hiển thị slots dạng timeline/calendar view
- **Better form UX**: Date picker rõ ràng hơn, time range validation
- **Quick actions**: Duplicate slot, bulk cancel
- **Status indicators**: Màu sắc rõ ràng hơn cho AVAILABLE/BOOKED/CANCELED

#### [MODIFY] `MeetingBookingSection` (trong student groups)

Cải thiện booking UX:
- **Calendar view**: Hiển thị available slots dạng mini-calendar
- **Time slot cards**: Rõ ràng hơn với start/end time, duration
- **Booking confirmation**: Modal xác nhận trước khi book
- **Booked meeting highlight**: Highlight meetings đã book

---

### Phase 9: Module Exports & Route Wiring

#### [MODIFY] [src/modules/groups/components/index.ts](file:///e:/Documents/F-spark-frontend/src/modules/groups/components/index.ts)

```ts
export { StudentGroupsPage } from "./student/student-groups-page";
export { MentorGroupsPage } from "./mentor/mentor-groups-page";
```

#### [MODIFY] [src/modules/dashboards/index.ts](file:///e:/Documents/F-spark-frontend/src/modules/dashboards/index.ts)

```ts
export * from "./api";
export * from "./components";
export * from "./hooks";
export type * from "./types";
export const DASHBOARDS_MODULE = { key: "dashboards", label: "Dashboards" } as const;
```

#### [NEW] Barrel files cho dashboards:

- `src/modules/dashboards/api/index.ts`
- `src/modules/dashboards/hooks/index.ts`
- `src/modules/dashboards/components/index.ts`
- `src/modules/dashboards/types/index.ts`

---

## Tổng hợp Files

| # | Action | File | Phase |
|---|--------|------|-------|
| 1 | MODIFY | `src/shared/types/enums.ts` | 1 |
| 2 | MODIFY | `src/shared/lib/query-keys.ts` | 1 |
| 3 | MODIFY | `src/modules/groups/types/index.ts` | 2 |
| 4 | MODIFY | `src/modules/groups/api/groups.api.ts` | 2 |
| 5 | NEW | `src/modules/groups/api/students.api.ts` | 3 |
| 6 | MODIFY | `src/modules/groups/api/index.ts` | 2–3 |
| 7 | NEW | `src/modules/groups/hooks/use-join-requests.ts` | 2 |
| 8 | NEW | `src/modules/groups/hooks/use-ungrouped-students.ts` | 3 |
| 9 | MODIFY | `src/modules/groups/hooks/index.ts` | 2–3 |
| 10 | NEW | `src/modules/dashboards/types/index.ts` | 4 |
| 11 | NEW | `src/modules/dashboards/api/dashboard.api.ts` | 4 |
| 12 | NEW | `src/modules/dashboards/api/index.ts` | 4 |
| 13 | NEW | `src/modules/dashboards/hooks/use-student-dashboard.ts` | 4 |
| 14 | NEW | `src/modules/dashboards/hooks/use-mentor-dashboard.ts` | 4 |
| 15 | NEW | `src/modules/dashboards/hooks/index.ts` | 4 |
| 16 | NEW | `src/modules/groups/components/student/student-groups-page.tsx` | 5 |
| 17 | NEW | `src/modules/groups/components/student/active-group-workspace.tsx` | 5 |
| 18 | NEW | `src/modules/groups/components/student/group-card.tsx` | 5 |
| 19 | NEW | `src/modules/groups/components/student/group-detail-modal.tsx` | 5 |
| 20 | NEW | `src/modules/groups/components/student/group-form-modal.tsx` | 5 |
| 21 | NEW | `src/modules/groups/components/student/member-list.tsx` | 5 |
| 22 | NEW | `src/modules/groups/components/student/invite-student-modal.tsx` | 5 |
| 23 | NEW | `src/modules/groups/components/student/invitation-list.tsx` | 5 |
| 24 | NEW | `src/modules/groups/components/student/join-request-section.tsx` | 5 |
| 25 | NEW | `src/modules/groups/components/student/ungrouped-students-section.tsx` | 5 |
| 26 | NEW | `src/modules/groups/components/student/meeting-booking-section.tsx` | 5 |
| 27 | NEW | `src/modules/groups/components/student/confirm-dialog.tsx` | 5 |
| 28 | NEW | `src/modules/dashboards/components/student-dashboard-page.tsx` | 6 |
| 29 | MODIFY | `src/app/student/dashboard/page.tsx` | 6 |
| 30 | MODIFY | `src/modules/groups/components/mentor-groups-page.tsx` | 7 |
| 31 | NEW | `src/modules/dashboards/components/mentor-dashboard-section.tsx` | 7 |
| 32 | MODIFY | `src/modules/mentoring/components/mentor-availability-page.tsx` | 8 |
| 33 | MODIFY | `src/modules/groups/components/index.ts` | 9 |
| 34 | MODIFY | `src/modules/dashboards/index.ts` | 9 |
| 35 | NEW | `src/modules/dashboards/components/index.ts` | 9 |
| 36 | DELETE | `src/modules/groups/components/student-groups-page.tsx` (old) | 5 |

**Tổng: 24 files mới + 12 files sửa + 1 file xóa = 37 thao tác**

---

## Quy chuẩn UI áp dụng (theo UI.md + colors.ts)

| Element | Token / Class |
|---|---|
| Brand actions (buttons) | `bg-brand-primary`, hover `bg-brand-primary-hover` |
| Card backgrounds | `bg-surface`, `shadow-card`, `rounded-2xl` |
| Interactive cards | `shadow-card-interactive`, `transition-all duration-200` |
| Input focus | `border-brand-secondary` |
| Text primary | `text-foreground` (Roboto) |
| Text secondary | `text-muted` |
| Status: ACTIVE/SUCCESS | `Badge tone="success"` |
| Status: PENDING/WARNING | `Badge tone="warning"` |
| Status: REJECTED/DANGER | `Badge tone="danger"` |
| Icons | `lucide-react` exclusively |
| Border radius | Cards `16px`, Buttons/Inputs `12px` |
| Color imports | `COLORS` from `@/shared/constants/colors` |
| Classnames | `cn()` from `@/shared/lib` |

---

## Verification Plan

### Automated Tests
```bash
npm run typecheck   # TypeScript strict check
npm run lint        # ESLint pass
npm run build       # Next.js build succeeds
```

### Manual Verification

**Join Request Flow:**
1. Login as Student (chưa có nhóm) → Groups → Browse groups
2. Click group → View Details → "Request to Join" → Submit
3. Verify request hiện PENDING trên card
4. Cancel request → Verify removed
5. Login as Leader → Groups → Xem Join Requests section
6. Approve request → Verify student joined
7. Test Reject flow

**Ungrouped Students:**
1. Login as Leader → Groups → "Find Students" section
2. Search by name/code → Verify results
3. Click Invite → Pre-filled modal → Submit

**Leave Group:**
1. Login as Member → Groups → Leave Group
2. Verify confirm dialog → Confirm → Redirected to "no group" view
3. Login as Leader → Try leave → Verify blocked (must transfer first)

**Student Dashboard:**
1. Login as Student → Dashboard
2. Verify stats cards, group progress bars, checkpoints
3. Verify empty states when no data

**Mentor Dashboard:**
1. Login as Mentor → Groups
2. Verify dashboard stats, meetings timeline
3. Verify progress bars per group

**Availability UX:**
1. Login as Mentor → Availability
2. Create slot → Verify improved form UX
3. Student (Leader) → Book meeting → Verify improved booking UX
