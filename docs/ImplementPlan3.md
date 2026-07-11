# Batch 3 — Feedback, Notifications, Terms & Milestones

## Muc tieu

Batch nay dua Frontend len OpenAPI dang chay ngay **2026-07-11**. Contract
canonical la [Swagger live](https://api-fspark.kusl.io.vn/v3/api-docs); phan
delta tuong ung da duoc ghi trong `docs/API.md`.

Muc tieu phoi hop la khong co hai nguoi cung sua mot file. Moi cong viec duoc
tach theo **module + route subtree**. Cac diem dung chung chi co Person 1 merge
theo handoff da dinh nghia trong `docs/TEAM_WORKFLOW.md`.

## Shared Baseline Da San Sang

Da co san truoc khi bat dau feature code:

- Enum API cho Feedback, Terms, Milestones, Submissions va Notifications trong
  `src/shared/types/enums.ts`.
- `UserRole` da co `INSTRUCTOR`; login redirect va AppShell co san navigation
  `/instructor/milestones` va `/instructor/submissions`.
- Types cua Admin Users da co `InstructorProfileDto`/input contract de Person 1
  chi can hoan thien form va presentation, khong sua shared foundation.
- Query key da khai bao trong `src/shared/lib/query-keys.ts`, gom notification,
  feedback, terms, milestones, instructor groups va admin overview.
- `apiGet`, `apiPost`, `apiPatch`, `apiPut`, `apiDelete` da co trong shared API
  client. Khong module nao dung `fetch` truc tiep.

Do do, Person 2 va Person 3 khong sua `src/shared/types/**`,
`src/shared/lib/query-keys.ts`, provider hay AppShell.

## Phan Cong Doc Lap

### Person 1 — Platform, Admin, Feedback & Terms

**So huu file/route**

- `src/modules/feedback/**`
- `src/app/admin/feedback/**`, `src/app/admin/terms/**`,
  `src/app/admin/groups/**`
- `src/app/student/feedback/**`, `src/app/mentor/feedback/**`
- `src/modules/dashboards/**` cho Admin Overview
- `src/shared/components/layout/app-shell.tsx` chi cho navigation va mount
  notification da handoff

**Endpoints**

- `GET /api/feedback/me?term&status`
- `GET /api/feedback/received?term&courseCode`
- `PUT /api/feedback/{id}` voi `rating` (1..5) va `comment` toi da 2,000 ky tu
- `GET /api/admin/feedback` voi page, size, term, courseCode, targetType,
  targetId, status
- `GET /api/admin/terms`; `PATCH /api/admin/terms/{term}/close`
- `GET /api/dashboard/admin/overview?term&courseCode&limit`
- UI Admin su dung public API cua Groups de gan instructor, khong sua module
  Groups

**Deliverables**

1. Student co danh sach feedback PENDING/SUBMITTED va form submit/update.
2. Mentor/Instructor xem feedback tong hop an danh; Admin xem danh sach co danh
   tinh va loc/phan trang.
3. Admin list/close term; UI yeu cau confirm truoc thao tac close.
4. Admin Overview hien thi thong ke backend tra ve.
5. Sau handoff cua Person 2, them navigation va mount `NotificationBell` mot
   lan trong AppShell.
6. Cap nhat Admin Users de ho tro `INSTRUCTOR` va Instructor profile
   (`instructorCode`, `fullName`, phone, department, expertise) theo Swagger.

### Person 2 — Groups, Meetings & Notifications

**So huu file/route**

- `src/modules/groups/**`, `src/modules/mentoring/**`,
  `src/modules/notifications/**`
- `src/app/student/groups/**`, `src/app/student/notifications/**`
- `src/app/mentor/groups/**`, `src/app/mentor/availability/**`

**Endpoints**

- `GET /api/notifications?page&size&unreadOnly`
- `GET /api/notifications/unread-count`
- `PATCH /api/notifications/{id}/read`; `PATCH /api/notifications/read-all`
- `GET /api/group-recruitment-roles`
- `PATCH /api/groups/{groupId}/lock` voi `{ isLock }`
- `PATCH /api/groups/{groupId}/mentor/meetings/{meetingId}/cancel`
- `GET /api/groups/instructor/me?term&courseCode`
- `PATCH /api/groups/{groupId}/instructor` voi `{ instructorId }`

**Deliverables**

1. `NotificationBell` public export: badge unread, popover danh sach unread,
   mark one/all read va `actionUrl` navigation an toan.
2. `/student/notifications` co history phan trang va filter unread.
3. Group UI dung role catalog, lock/unlock thanh vien va cancel meeting.
4. Public export `useInstructorGroups(filters)` tu `@/modules/groups`; Person 3
   chi duoc dung export nay, khong sua code Groups.
5. UI/API mutation assign instructor phuc vu Admin duoc public qua module
   Groups; Person 1 so huu trang Admin dung hook nay.

### Person 3 — Milestones, Deliverables & Grades

**So huu file/route**

- `src/modules/milestones/**`
- `src/app/instructor/**`
- `src/app/student/tasks/**` (gom `submissions/**`)
- `src/modules/projects/**` neu can diem vao Kanban/task UI

**Endpoints canonical**

- `GET|POST /api/instructor/milestones`; `GET|PUT|PATCH|DELETE`
  `/api/instructor/milestones/{id}`
- `GET /api/groups/{groupId}/milestones`
- `POST /api/milestone-submissions`; `GET|PUT /api/milestone-submissions/{id}`
- `GET /api/milestone-submissions/milestones/{milestoneId}` và
  `/groups/{groupId}`
- `GET|POST /api/milestone-submissions/{submissionId}/grades`; `PUT`
  `/api/milestone-submissions/grades/{gradeId}`
- `GET /api/milestone-submissions/groups/{groupId}/grades`
- `GET /api/instructor/submissions` voi term, courseCode, milestoneId, groupId,
  status va late
- `GET /api/student-groups/{groupId}/average-grade`

**Deliverables**

1. Instructor CRUD milestone, loc theo term/courseCode, va khong goi endpoint
   `course-milestones` alias hoac `*/outcomes` deprecated.
2. Student xem timeline cua group, submit/resubmit deliverable URL va xem score,
   feedback, late status.
3. Instructor list/filter submission cua cac group duoc gan, cham/sua diem va
   xem weighted average cua group.
4. Nut/popup submission gan voi milestone tren trang Tasks/Kanban.
5. Dung `useInstructorGroups` public tu Groups de lay group scope; khong sua
   `src/modules/groups/**`.
6. Tao `src/app/instructor/layout.tsx` voi `AppShell role="INSTRUCTOR"`; khong
   sua AppShell.

## Thu Tu Handoff

1. Person 2 merge data layer Groups (`useInstructorGroups`, assign instructor)
   va Notifications (`NotificationBell`) truoc UI integration.
2. Person 3 co the phat trien milestones doc lap; khi can group list thi import
   public hook da handoff.
3. Person 1 merge Admin group assignment, Feedback/Terms, sau do mount
   `NotificationBell` va them navigation trong AppShell. Day la commit duy nhat
   cham vao AppShell.

## Acceptance Checklist

- DTO/request/query khop `docs/API.md` va Swagger live; khong tao endpoint URL
  rieng.
- Mutation invalidate root query key lien quan; mark notification con invalidate
  list va unreadCount.
- Form feedback validate rating 1..5; form submission bat buoc `fileUrl`,
  `groupId`, `milestoneId`; form lock gui boolean `isLock`.
- `actionUrl` notification chi navigation noi bo; khong render HTML/payload tu
  backend.
- Moi nguoi chay `npm run typecheck` va `npm run lint` tren branch cua minh.
- PR khong sua file nam ngoai ownership, tru commit handoff cua Person 1.
