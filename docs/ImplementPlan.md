Implementation Plan: Groups & Mentoring Modules (Person 2)
Triển khai đầy đủ 2 module groups và mentoring cho vai trò Person 2, bao gồm API layer, types, hooks, components, và 3 route pages. Hiện tại tất cả đều là empty stubs (export {}).

Tình trạng hiện tại
File Trạng thái
src/modules/groups/api/index.ts export {} — trống
src/modules/groups/types/index.ts export {} — trống
src/modules/groups/hooks/index.ts export {} — trống
src/modules/groups/components/index.ts export {} — trống
src/modules/mentoring/api/index.ts export {} — trống
src/modules/mentoring/types/index.ts export {} — trống
src/modules/mentoring/hooks/index.ts export {} — trống
src/modules/mentoring/components/index.ts export {} — trống
src/app/student/groups/page.tsx <ModulePlaceholder> stub
src/app/mentor/groups/page.tsx <ModulePlaceholder> stub
src/app/mentor/availability/page.tsx <ModulePlaceholder> stub
Infrastructure đã sẵn sàng: API client (apiGet/Post/Patch/Delete), query keys (queryKeys.groups._, queryKeys.mentoring._), enums (GroupStatus, InvitationStatus, SlotStatus, MeetingStatus), shared UI components (Button, Card, Badge, TextInput, Select, PageHeader, EmptyState, LoadingState).

Design Decisions (Aligned with User)
- **Số lượng nhóm của Student**: Sinh viên chỉ thuộc tối đa 1 nhóm.
- **Routing & Layout cho Student Groups**: 
  - Nếu sinh viên đã có nhóm: Hiển thị giao diện chi tiết nhóm của mình trực tiếp (inline workspace) trên trang `/student/groups` để thuận tiện theo dõi và thao tác.
  - Nếu chưa có nhóm: Hiển thị danh sách các nhóm đang tuyển thành viên kèm theo lời mời. Khi nhấn xem chi tiết của một nhóm khác, hiển thị dưới dạng **Modal** (read-only) để không làm mất trạng thái tìm kiếm.
  - Các biểu mẫu tương tác (Tạo nhóm, Gửi lời mời, Đặt lịch hẹn) sẽ sử dụng **Modal** để tập trung thao tác.
- **Quyền sửa Query Keys**: Được phép bổ sung các query keys cần thiết trực tiếp vào `src/shared/lib/query-keys.ts`.

Proposed Changes
Thứ tự triển khai: Types → API → Hooks → Components → Routes. Module groups trước, mentoring sau.

Phase 1: Groups Module — Data Layer
[NEW]
groups.types.ts
Định nghĩa tất cả DTO và request types theo API.md:

ts

// DTOs
GroupSummaryDto // API 3.1, 3.9, 3.10
GroupDetailDto // API 3.2
GroupMemberDto // Nested in GroupDetailDto
SelectedProblemSummaryDto // Nested in Group DTOs
InvitationDto // API 4.1–4.6
// Request types
CreateGroupRequest // API 3.3 — term, courseCode, name, projectName?, ideaDescription?, researchDomain?, requiredGpa?, targetGrade?
UpdateGroupRequest // API 3.4 — name?, projectName?, ideaDescription?, researchDomain?, requiredGpa?, targetGrade?
UpdateGroupCriteriaRequest // API 3.5 — requiredGpa?, targetGrade?
TransferLeaderRequest // API 3.6 — studentId
InviteStudentRequest // API 4.1 — studentCodeOrEmail, message?
// Query types
GroupsQuery // search?: string
[NEW]
groups.api.ts
API functions sử dụng apiGet/apiPost/apiPatch/apiDelete từ @/shared/lib:

Function Endpoint Method
listGroups(query?) GET /api/groups apiGet
getGroup(id) GET /api/groups/{id} apiGet
createGroup(payload) POST /api/groups apiPost
updateGroup(id, payload) PATCH /api/groups/{id} apiPatch
updateGroupCriteria(id, payload) PATCH /api/groups/{id}/criteria apiPatch
transferLeadership(groupId, payload) PATCH /api/groups/{groupId}/leader apiPatch
removeMember(groupId, studentId) DELETE /api/groups/{groupId}/members/{studentId} apiDelete
leaveGroup(groupId) DELETE /api/groups/{groupId}/members/me apiDelete
getMyGroups() GET /api/groups/student/me apiGet
getMentorGroups() GET /api/groups/mentor/me apiGet
inviteStudent(groupId, payload) POST /api/groups/{groupId}/invitations apiPost
getGroupInvitations(groupId) GET /api/groups/{groupId}/invitations apiGet
getMyInvitations() GET /api/groups/invitations/me apiGet
acceptInvitation(invitationId) POST /api/groups/invitations/{id}/accept apiPost
declineInvitation(invitationId) POST /api/groups/invitations/{id}/decline apiPost
cancelInvitation(invitationId) POST /api/groups/invitations/{id}/cancel apiPost
[MODIFY]
api/index.ts
Thay export {} bằng export \* from "./groups.api".

Phase 2: Groups Module — Hooks
[NEW]
use-groups.ts
ts

useGroups(query?) // useQuery → listGroups
useGroup(groupId) // useQuery → getGroup (enabled khi có id)
useMyGroups() // useQuery → getMyGroups
useMentorGroups() // useQuery → getMentorGroups
[NEW]
use-group-mutations.ts
ts

useCreateGroup() // useMutation → invalidate groups.all
useUpdateGroup() // useMutation → invalidate groups.all + groups.detail
useUpdateGroupCriteria() // useMutation → invalidate groups.all + groups.detail
useTransferLeadership() // useMutation → invalidate groups.detail
useRemoveMember() // useMutation → invalidate groups.detail
useLeaveGroup() // useMutation → invalidate groups.all
[NEW]
use-invitations.ts
ts

useGroupInvitations(groupId) // useQuery → getGroupInvitations
useMyInvitations() // useQuery → getMyInvitations
useInviteStudent() // useMutation → invalidate invitations key
useAcceptInvitation() // useMutation → invalidate groups + invitations
useDeclineInvitation() // useMutation → invalidate invitations
useCancelInvitation() // useMutation → invalidate invitations
[MODIFY]
hooks/index.ts
Barrel export tất cả hooks files.

Phase 3: Mentoring Module — Data Layer
[NEW]
mentoring types/index.ts
ts

// DTOs (from API.md)
MentorAvailabilitySlotDto // id, mentorId/Code/Name, startAt, endAt, meetLink, note, status, timestamps
MentorMeetingDto // id, slotId, groupId/Name/No, mentorId/Code/Name, bookedByStudent info, timestamps
// Request types
CreateAvailabilitySlotRequest // startAt, endAt, meetLink, note?
UpdateAvailabilitySlotRequest // startAt?, endAt?, meetLink?, note?
BookMeetingRequest // slotId
[NEW]
mentoring.api.ts
Function Endpoint Method
listMyAvailability() GET /api/mentor/availability apiGet
createAvailabilitySlot(payload) POST /api/mentor/availability apiPost
updateAvailabilitySlot(id, payload) PATCH /api/mentor/availability/{id} apiPatch
cancelAvailabilitySlot(id) DELETE /api/mentor/availability/{id} apiDelete
getMentorAvailability(groupId) GET /api/groups/{groupId}/mentor/availability apiGet
bookMeeting(groupId, payload) POST /api/groups/{groupId}/mentor/meetings apiPost
getGroupMeetings(groupId) GET /api/groups/{groupId}/mentor/meetings apiGet
[MODIFY]
mentoring api/index.ts
export \* from "./mentoring.api"

Phase 4: Mentoring Module — Hooks
[NEW]
use-availability.ts
ts

useMyAvailability() // useQuery → listMyAvailability
useMentorAvailabilityForGroup(groupId) // useQuery → getMentorAvailability
[NEW]
use-availability-mutations.ts
ts

useCreateSlot() // useMutation → invalidate mentoring.availability
useUpdateSlot() // useMutation → invalidate mentoring.availability
useCancelSlot() // useMutation → invalidate mentoring.availability
[NEW]
use-meetings.ts
ts

useGroupMeetings(groupId) // useQuery → getGroupMeetings
useBookMeeting() // useMutation → invalidate meetings + availability
[MODIFY]
mentoring hooks/index.ts
Barrel export tất cả hooks.

Phase 5: UI Components — Student Groups Page
[NEW]
student-groups-page.tsx
Trang chính cho Student. Dựa trên trạng thái nhóm của sinh viên:

Trường hợp 1: Sinh viên ĐÃ thuộc một nhóm (Active Group Workspace)
- PageHeader (eyebrow="Student", title="My Group Workspace")
- Group Detail Dashboard (Hiển thị inline trực tiếp trên trang):
  ├── Info section: term, courseCode, projectName, ideaDescription, researchDomain
  ├── Criteria section: requiredGpa, targetGrade
  ├── Members list + role badges (LEADER/MEMBER)
  ├── Actions (Leader only):
  │   ├── Edit Group Info button → Mở Edit Group Modal
  │   ├── Invite Member button → Mở Invite Modal
  │   ├── Remove Member action
  │   ├── Transfer Leadership action
  │   └── View Sent Invitations
  ├── Actions (Member only):
  │   └── Leave Group button (sử dụng modal/confirm dialog)
  └── Mentor & Meeting Scheduling Section:
      ├── Mentor profile info
      ├── Available Slots (Danh sách slot trống của Mentor)
      └── Book Meeting action (Leader only)

Trường hợp 2: Sinh viên CHƯA thuộc nhóm nào (Recruiting & Joining)
- PageHeader (eyebrow="Student", title="Groups", actions=[Create Group button])
- Invitation Banner / List (Nếu có lời mời kết nạp → hiển thị để Accept/Decline)
- Recruiting Groups Section:
  ├── Search/Filter bar (Tìm theo tên nhóm hoặc courseCode)
  ├── GroupCard Grid (Hiển thị các nhóm đang tuyển thành viên):
  │   ├── Group name, term, courseCode
  │   ├── Member count, Leader name
  │   ├── Status badge
  │   └── "View Details" button → mở Group Detail Modal (read-only)
  └── Group Detail Modal (Read-only): Xem thông tin nhóm khác để quyết định xin gia nhập/chấp nhận lời mời.

- Create Group Modal: Form nhập term, courseCode, name, projectName, ideaDescription, researchDomain, requiredGpa, targetGrade.
Sub-components cần tạo:

Component Mô tả
StudentGroupsPage Page chính, orchestrate state
GroupCard Card hiển thị GroupSummaryDto
GroupDetailModal Modal chi tiết nhóm
CreateGroupModal Form tạo nhóm mới
EditGroupForm Form chỉnh sửa thông tin nhóm (trong modal)
MemberList Danh sách thành viên + actions
InviteStudentModal Form gửi lời mời
InvitationList Danh sách invitations (sent + received)
MeetingBookingSection Xem slots + đặt lịch họp với Mentor
Quy chuẩn Giao diện & Màu sắc (UI & Colors Style Guide theo UI.md):
- **Components sử dụng:** Tái sử dụng tối đa các components dùng chung trong `@/shared/components` (`PageHeader`, `Card`, `CardHeader`, `CardContent`, `Badge`, `Button`, `TextInput`, `Select`). Không tự viết lại custom styles nếu component dùng chung đã đáp ứng được.
- **Bảng màu (Color Palette & TypeScript constants):**
  - Trong style inline hoặc TypeScript logic cần chỉ định màu, import `COLORS` từ `@/shared/constants/colors` (ví dụ: `COLORS.brandPrimary` tương ứng với `var(--brand-primary)`). Không hardcode hex màu trực tiếp.
  - Màu thương hiệu chính: `COLORS.brandPrimary` (`#F05423` / Tailwind `bg-brand-primary`) dùng cho các nút hành động chính, active states, active badges. Nút hover dùng `COLORS.brandPrimaryHover` (`#d84315`).
  - Màu thương hiệu phụ: `COLORS.brandSecondary` (`#EDA12F` / Tailwind `border-brand-secondary`) dùng cho đường viền của inputs khi `focus` và một số badge phụ.
  - Màu nền (Background): Nền trang chính là `COLORS.background` (`#F5F5F5` / Tailwind `bg-background`), nền Card/Modal/Input là màu trắng tinh `COLORS.surface` (`#ffffff` / Tailwind `bg-surface`).
  - Màu chữ (Typography): Roboto font. Chữ chính dùng `COLORS.foreground` (`#1a1a1a` / Tailwind `text-foreground`), chữ chú thích/labels/placeholder dùng `COLORS.muted` (`#737373` / Tailwind `text-muted`).
  - Đường viền (Borders): Dùng `1px solid var(--border)` (`COLORS.border` hoặc `COLORS.borderWarm`) cho card border và inputs. Bo góc tối đa `16px` cho card, `12px` cho inputs/buttons/badges.
- **Màu sắc trạng thái (Semantic Status Tones):**
  - **ACTIVE / AVAILABLE / SUCCESS:** Dùng badge tone `success` (Xanh lá).
  - **PENDING / BOOKED / WARNING:** Dùng badge tone `warning` (Vàng/Cam).
  - **CANCELED / DECLINED / DANGER:** Dùng badge tone `danger` (Đỏ).
- **Hiệu ứng & Shadows (Shadows & Micro-interactions):**
  - Các card thông tin sử dụng shadow mờ: `box-shadow: 0 10px 30px rgba(26, 26, 26, 0.03)` (Tailwind `shadow-card`).
  - Card có tương tác (hover) hoặc active state: `box-shadow: 0 20px 45px rgba(26, 26, 26, 0.04)` (Tailwind `shadow-card-interactive`) và chuyển động mượt `transition-all duration-200 ease-in-out`.
- **Icons:** Sử dụng hoàn toàn bộ icon từ `lucide-react` (ví dụ: `Users`, `Plus`, `Pencil`, `Trash2`, `CalendarClock`, `Mail`, `UserPlus`, `SlidersHorizontal`).
Phase 6: UI Components — Mentor Groups Page
[NEW]
mentor-groups-page.tsx
Layout:

PageHeader (eyebrow="Mentor", title="My Groups")
├── LoadingState / EmptyState
└── GroupCard Grid (from getMentorGroups)
├── Group name, term, courseCode
├── Member count, Leader name
├── Selected problem (nếu có)
└── Expand → Group Detail (read-only)
├── Members list
├── Upcoming meetings list (from useGroupMeetings)
└── Group info
Phase 7: UI Components — Mentor Availability Page
[NEW]
mentor-availability-page.tsx
Layout:

PageHeader (eyebrow="Mentor", title="Availability", actions=[Create Slot button])
├── Card: Upcoming Slots
│ ├── Toolbar: Filter by status (All / Available / Booked / Canceled)
│ ├── LoadingState / EmptyState
│ └── Slot Table/List
│ ├── Date/Time (startAt → endAt, formatted)
│ ├── Meet Link (clickable)
│ ├── Note
│ ├── Status Badge (AVAILABLE=success, BOOKED=brand, CANCELED=danger)
│ └── Actions:
│ ├── Edit (if AVAILABLE) → Edit Slot Modal
│ └── Cancel (if AVAILABLE) → Confirm dialog
└── Create/Edit Slot Modal
├── Form: Date picker (startAt), Time range (startAt, endAt), meetLink, note
├── Validation: meetLink phải match regex Google Meet
└── Submit → useCreateSlot / useUpdateSlot
Sub-components:

Component Mô tả
MentorAvailabilityPage Page chính
AvailabilitySlotTable Bảng/list hiển thị slots
SlotFormModal Form tạo/sửa slot
Phase 8: Route Pages — Wire Up
[MODIFY]
student/groups/page.tsx
tsx

import { StudentGroupsPage } from "@/modules/groups";
export default function StudentGroupsRoute() {
return <StudentGroupsPage />;
}
[MODIFY]
mentor/groups/page.tsx
tsx

import { MentorGroupsPage } from "@/modules/groups";
export default function MentorGroupsRoute() {
return <MentorGroupsPage />;
}
[MODIFY]
mentor/availability/page.tsx
tsx

import { MentorAvailabilityPage } from "@/modules/mentoring";
export default function MentorAvailabilityRoute() {
return <MentorAvailabilityPage />;
}
Phase 9: Query Keys Update (Protected File)
[MODIFY]
query-keys.ts
WARNING

File này thuộc Person 1. Cần thêm keys sau nếu được phép:

ts

groups: {
// ... existing keys ...
studentMe: () => [...queryKeys.groups.all, "student", "me"] as const,
mentorMe: () => [...queryKeys.groups.all, "mentor", "me"] as const,
invitations: (groupId: number) =>
[...queryKeys.groups.all, groupId, "invitations"] as const,
myInvitations: () =>
[...queryKeys.groups.all, "invitations", "me"] as const,
},
mentoring: {
// ... existing keys ...
groupAvailability: (groupId: number) =>
[...queryKeys.mentoring.all, "groups", groupId, "availability"] as const,
},
File Tổng hợp — Tất cả files cần tạo/sửa

# Action File Phase

1 MODIFY src/modules/groups/types/index.ts 1
2 NEW src/modules/groups/api/groups.api.ts 1
3 MODIFY src/modules/groups/api/index.ts 1
4 NEW src/modules/groups/hooks/use-groups.ts 2
5 NEW src/modules/groups/hooks/use-group-mutations.ts 2
6 NEW src/modules/groups/hooks/use-invitations.ts 2
7 MODIFY src/modules/groups/hooks/index.ts 2
8 MODIFY src/modules/mentoring/types/index.ts 3
9 NEW src/modules/mentoring/api/mentoring.api.ts 3
10 MODIFY src/modules/mentoring/api/index.ts 3
11 NEW src/modules/mentoring/hooks/use-availability.ts 4
12 NEW src/modules/mentoring/hooks/use-availability-mutations.ts 4
13 NEW src/modules/mentoring/hooks/use-meetings.ts 4
14 MODIFY src/modules/mentoring/hooks/index.ts 4
15 NEW src/modules/groups/components/student-groups-page.tsx 5
16 NEW src/modules/groups/components/mentor-groups-page.tsx 6
17 MODIFY src/modules/groups/components/index.ts 5–6
18 NEW src/modules/mentoring/components/mentor-availability-page.tsx 7
19 MODIFY src/modules/mentoring/components/index.ts 7
20 MODIFY src/app/student/groups/page.tsx 8
21 MODIFY src/app/mentor/groups/page.tsx 8
22 MODIFY src/app/mentor/availability/page.tsx 8
23 MODIFY src/shared/lib/query-keys.ts ⚠️ 9
Tổng: 10 files mới + 13 files sửa = 23 thao tác

Verification Plan
Automated Tests
bash

npm run typecheck # TypeScript strict check
npm run lint # ESLint pass
Manual Verification
Student Groups flow:

Login as Student → Navigate to Groups
Tạo group mới → Verify group card xuất hiện
Mở group detail → Xem members, info, mentor
Invite student → Verify invitation xuất hiện
Accept/Decline invitation (đổi tài khoản)
Leave group / Remove member / Transfer leader
Mentor Groups flow:

Login as Mentor → Navigate to Groups
Xem danh sách groups assigned
Xem chi tiết nhóm + members + meetings
Mentor Availability flow:

Login as Mentor → Navigate to Availability
Tạo slot mới → Verify hiện trong list
Edit slot → Verify cập nhật
Cancel slot → Verify status đổi
Meeting Booking flow (cross-module):

Student (Leader) → Group Detail → Xem mentor availability
Book meeting → Verify slot status đổi thành BOOKED
Mentor → Groups → Xem meeting xuất hiện
