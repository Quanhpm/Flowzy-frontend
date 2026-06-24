# F-Spark Frontend Team Workflow

Tai lieu nay la context bat buoc cho teammate va AI coding agent truoc khi code trong repo nay.
Muc tieu: moi nguoi code theo module rieng, dung chung foundation, han che conflict va khong viet lai API/client/query style moi.

## Project Snapshot

- Framework: Next.js App Router, TypeScript.
- Styling: Tailwind CSS v4 utilities, with theme tokens in `src/app/globals.css`.
- Data fetching/cache: TanStack React Query.
- Auth state: Zustand persisted store.
- Backend reference: `API.md`.
- Base API URL mac dinh: `https://api-fspark.kusl.io.vn`.
- Shared API client: `src/shared/lib/api-client.ts`.
- Shared API response/types/enums: `src/shared/types`.
- Query key convention: `src/shared/lib/query-keys.ts`.

## Module Ownership

### Person 1 - Core, Auth, Admin Users, Imports

Owner:

- `src/shared/lib/**`
- `src/shared/types/**`
- `src/shared/constants/**`
- `src/providers/**`
- `src/modules/auth/**`
- `src/modules/users/**`
- `src/modules/imports/**`
- `src/app/admin/users/**`
- `src/app/admin/imports/**`

Endpoints:

- `/api/auth/**`
- `/api/admin/users/**`
- `/api/imports/**`

### Person 2 - Groups, Invitations, Mentor Scheduling

Owner:

- `src/modules/groups/**`
- `src/modules/mentoring/**`
- `src/app/student/groups/**`
- `src/app/mentor/availability/**`
- `src/app/mentor/groups/**`

Endpoints:

- `/api/groups`
- `/api/groups/{id}`
- `/api/groups/student/me`
- `/api/groups/mentor/me`
- `/api/groups/{groupId}/invitations`
- `/api/groups/invitations/**`
- `/api/mentor/availability/**`
- `/api/groups/{groupId}/mentor/availability`
- `/api/groups/{groupId}/mentor/meetings`

Note: Neu endpoint co prefix `/api/groups/{groupId}` nhung la `/board`, `/tasks/**`, hoac `/problems/**` thi thuoc Person 3.

### Person 3 - Tasks, Kanban, Problems, Problem Bank

Owner:

- `src/modules/projects/**`
- `src/modules/problems/**`
- `src/app/student/tasks/**`
- `src/app/student/problems/**`
- `src/app/admin/problems/**`

Endpoints:

- `/api/groups/{groupId}/board`
- `/api/groups/{groupId}/tasks/**`
- `/api/tasks/me`
- `/api/problems/**`
- `/api/groups/{groupId}/problems/**`
- `/api/admin/problems/**`
- `/api/problem-domains`
- `/api/admin/problem-domains/**`
- `/api/problem-evaluation-criteria`

Note: Person 3 co the doc group id/member data de render UI, nhung khong sua module `groups` neu khong can.

## Protected Shared Files

Khong tu y sua cac file nay neu khong phai owner hoac chua bao team:

- `src/shared/lib/api-client.ts`
- `src/shared/lib/query-keys.ts`
- `src/shared/types/**`
- `src/shared/constants/**`
- `src/providers/app-providers.tsx`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `src/modules/index.ts`

Neu module can type/enum/query key chung moi, uu tien bao Person 1 them vao shared. Khong tao type trung lap moi module neu do la contract chung trong `API.md`.

`src/app/globals.css` chi duoc dung cho Tailwind import, theme tokens, CSS variables tuong thich `COLORS`, va base element rules. Khong them layout/style rieng cua module vao file nay.

## Module Folder Standard

Moi module nen theo cau truc:

```txt
src/modules/<module>/
  api/
    index.ts
    <module>.api.ts
  components/
    index.ts
  hooks/
    index.ts
    use-*.ts
  types/
    index.ts
  index.ts
```

Quy tac:

- API functions nam trong `api/*.api.ts`.
- DTO/request/query types nam trong `types/index.ts`.
- React Query hooks nam trong `hooks/use-*.ts`.
- UI component rieng module nam trong `components`.
- Public exports di qua `src/modules/<module>/index.ts`.
- Khong import component cheo module khi chua can thiet. Neu can shared UI, dua vao `src/shared/components`.

## API Client Usage

Dung helper tu `@/shared/lib`. Khong viet `fetch` truc tiep trong module.

Available helpers:

```ts
import {
  apiDelete,
  apiDownload,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
  apiUpload,
} from "@/shared/lib";
```

API client tu gan bearer token thong qua `AppProviders`, nen endpoint da auth khong can truyen token.

### GET With Query Params

```ts
import { apiGet } from "@/shared/lib";
import type { ApiResponse, PageResponse } from "@/shared/types";

export function listSomething(query?: { page?: number; size?: number; search?: string }) {
  return apiGet<ApiResponse<PageResponse<SomethingDto>>>("/api/something", {
    query,
  });
}
```

### POST/PATCH JSON

```ts
import { apiPost, apiPatch } from "@/shared/lib";
import type { ApiResponse } from "@/shared/types";

export function createSomething(payload: CreateSomethingRequest) {
  return apiPost<ApiResponse<SomethingDto>>("/api/something", payload);
}

export function updateSomething(id: number, payload: UpdateSomethingRequest) {
  return apiPatch<ApiResponse<SomethingDto>>(`/api/something/${id}`, payload);
}
```

### Public Auth Endpoints

Endpoint khong can token phai dung `auth: false`.

```ts
apiPost<ApiResponse<TokenResponse>>("/api/auth/login", credentials, {
  auth: false,
});
```

### Upload File

Dung `apiUpload`, khong set `Content-Type` thu cong. Browser se tu set multipart boundary.

```ts
const formData = new FormData();
formData.append("file", file);

return apiUpload<ApiResponse<ImportResponse>>(
  "/api/imports/students",
  formData,
);
```

### Download File

`apiDownload` tra ve `Blob`.

```ts
const blob = await apiDownload("/api/imports/templates/students");
```

## Shared Types Usage

Dung type chung tu `@/shared/types`.

```ts
import type {
  ApiResponse,
  PageResponse,
  UserRole,
  UserStatus,
  TaskStatus,
  ProblemStatus,
  ISODateTimeString,
} from "@/shared/types";
```

Backend response wrapper:

```ts
type ApiResponse<T> = {
  code: number;
  message: string;
  data: T;
};
```

Paginated response:

```ts
type PageResponse<T> = {
  content: T[];
  page: number;
  number: number;
  size: number;
  numberOfElements: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
};
```

Important:

- User role theo API chi co `"ADMIN" | "STUDENT" | "MENTOR"`.
- Khong dung `"INSTRUCTOR"` cho API role.
- Ngay gio ISO dung `ISODateTimeString`.
- ID backend la `number`.

## TanStack Query Usage

Dung `useQuery` cho read/list/detail, `useMutation` cho create/update/delete/upload/download/action.

Query keys lay tu:

```ts
import { queryKeys } from "@/shared/lib";
```

### Query Example

```ts
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";

import { listGroups } from "../api";
import type { GroupsQuery } from "../types";

export function useGroups(query: GroupsQuery = {}) {
  return useQuery({
    queryKey: queryKeys.groups.list(query),
    queryFn: () => listGroups(query),
  });
}
```

### Detail Query Example

```ts
export function useGroup(groupId: number | null | undefined) {
  return useQuery({
    enabled: typeof groupId === "number",
    queryKey:
      typeof groupId === "number"
        ? queryKeys.groups.detail(groupId)
        : [...queryKeys.groups.all, "detail", "empty"],
    queryFn: () => {
      if (typeof groupId !== "number") {
        throw new Error("A group id is required.");
      }

      return getGroup(groupId);
    },
  });
}
```

### Mutation Example

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/lib";

export function useCreateGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.groups.all });
    },
  });
}
```

Mutation rule:

- Sau create/update/delete nen invalidate module root key.
- Sau update detail nen invalidate ca list va detail.
- Khong hardcode query key string moi neu `queryKeys` da co key phu hop.

## Query Key Convention

Pattern hien tai:

```ts
queryKeys.users.list(filters)
queryKeys.users.detail(id)
queryKeys.imports.batch(id)
queryKeys.groups.list(filters)
queryKeys.groups.detail(id)
queryKeys.mentoring.availability()
queryKeys.mentoring.meetings(groupId)
queryKeys.problems.list(filters)
queryKeys.problems.detail(id)
queryKeys.problems.domains(filters)
queryKeys.problems.criteria()
queryKeys.tasks.board(groupId, filters)
queryKeys.tasks.detail(groupId, taskId)
queryKeys.tasks.mine(filters)
```

Neu can key moi cho module cua minh:

- Them vao `src/shared/lib/query-keys.ts` neu do la key dung chung giua nhieu file/module.
- Neu chi noi bo module va chua muon sua shared, co the dat local `const moduleQueryKeys` trong module, nhung nen thong bao team de hop nhat sau.

## Auth Usage

Auth exports:

```ts
import {
  useAuthStore,
  useAuthHydrated,
  useCurrentUser,
  useLogin,
  useGoogleLogin,
  useLogout,
  useRefreshSession,
} from "@/modules/auth";
```

Common usage:

```ts
const session = useAuthStore((state) => state.session);
const role = session?.user.role;
```

API client da tu doc access token tu auth store, nen module API function khong can lay token thu cong.

## Route Ownership

Route placeholders da co san:

```txt
src/app/admin/users/page.tsx
src/app/admin/imports/page.tsx
src/app/admin/problems/page.tsx
src/app/student/dashboard/page.tsx
src/app/student/groups/page.tsx
src/app/student/tasks/page.tsx
src/app/student/problems/page.tsx
src/app/mentor/availability/page.tsx
src/app/mentor/groups/page.tsx
```

Chi code UI that trong route thuoc ownership cua minh.

## Before Coding Checklist For AI

Truoc khi sua code, AI phai:

1. Doc `TEAM_WORKFLOW.md`.
2. Doc `API.md` phan endpoint/module lien quan.
3. Xac dinh module ownership cua task.
4. Tim file co san bang `rg` hoac `rg --files`.
5. Khong sua protected shared files neu task khong yeu cau.
6. Dung Tailwind utility classes va shared UI primitives; khong tao CSS Modules moi.
7. Dung `apiGet/apiPost/apiPatch/apiPut/apiDelete/apiUpload/apiDownload`.
8. Dung `useQuery/useMutation` va `queryKeys`.
9. Chay `npm run typecheck`.
10. Chay `npm run lint`.

## Coding Rules

- TypeScript strict, khong dung `any` neu khong bat buoc.
- DTO/request/query types phai khop `API.md`.
- Component UI khong nen chua logic fetch truc tiep; goi hooks tu module.
- API functions khong nen import React/TanStack.
- Hooks khong nen render UI.
- UI styling dung Tailwind utilities; khong tao CSS Modules hoac global CSS cho module-specific layouts.
- Khong duplicate enum/type da co trong `src/shared/types`.
- Khong set `Content-Type` khi upload `FormData`.
- Khong tu tao API base URL rieng.
- Khong hardcode token trong request.
- Khong sua file cua nguoi khac neu khong can.

## Handoff Summary For Teammates

Neu ban la Person 2:

- Bat dau trong `src/modules/groups` va `src/modules/mentoring`.
- Implement API/types/hooks truoc, sau do moi lam UI route.
- Dung `queryKeys.groups` va `queryKeys.mentoring`.

Neu ban la Person 3:

- Bat dau trong `src/modules/projects` cho task board/Kanban.
- Bat dau trong `src/modules/problems` cho problem bank.
- Dung `queryKeys.tasks` va `queryKeys.problems`.

Neu can shared contract moi, tao PR/commit rieng hoac bao Person 1 de them, tranh moi nguoi sua chung mot file cung luc.
