# F-Spark Frontend

Frontend cho EXE Project Management System, xây dựng bằng Next.js App Router và TypeScript.

## Chạy dự án

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000).

## Google sign-in

Tạo OAuth 2.0 Web Client trong Google Cloud Console, thêm origin của frontend
(`http://localhost:3000` khi phát triển và domain production), sau đó cấu hình:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
NEXT_PUBLIC_GOOGLE_HOSTED_DOMAIN=your-school-domain.edu.vn
```

`NEXT_PUBLIC_GOOGLE_HOSTED_DOMAIN` là tùy chọn. Backend nhận Google ID token qua
`POST /api/auth/google`, sau đó frontend lưu phiên đăng nhập F-Spark bằng Zustand.

API mặc định trỏ tới `https://api-fspark.kusl.io.vn`. Có thể thay đổi qua
`NEXT_PUBLIC_API_BASE_URL` trong `.env.local`.

## Cấu trúc chính

```text
src/
├── app/                 # Route, layout và composition theo App Router
│   ├── (auth)/
│   ├── (student)/
│   ├── (instructor)/
│   ├── (mentor)/
│   └── (admin)/
├── modules/             # Nghiệp vụ tách theo feature
├── providers/           # Provider cấp ứng dụng
└── shared/              # UI, hook, config, lib và type dùng chung
```

Các module nghiệp vụ ban đầu:

- `auth`: đăng nhập Google bằng email trường và phân quyền.
- `users`: student, instructor, mentor, admin và import tài khoản.
- `academics`: semester, course, class và enrollment.
- `groups`: nhóm, leader, invitation, join request và kick request.
- `problems`: Problem Bank và problem do nhóm đề xuất.
- `projects`: draft, proposal, approval, active project và change request.
- `checkpoints`: template và tiến độ EXE101.
- `outcomes`: template và kết quả EXE201.
- `mentoring`: hồ sơ mentor, availability và booking.
- `grading`: review, feedback, rubric và điểm.
- `dashboards`: dữ liệu tổng quan theo từng vai trò.

## Quy ước module

Mỗi module chỉ public những gì bên ngoài cần dùng qua file `index.ts`. Khi triển khai chi tiết, có thể thêm dần các thư mục sau bên trong module:

```text
module-name/
├── components/          # UI thuộc riêng module
├── hooks/               # Hook và query hook của module
├── schemas/             # Schema validate form/request
├── services/            # Giao tiếp API và use case phía client
├── types/               # Type thuộc domain
└── index.ts              # Public API của module
```

Không import xuyên vào file nội bộ của module khác; import từ public entry point của module đó.

## Authentication

Module `auth` hiện gồm:

- TanStack Query mutation cho email/password và Google Workspace login.
- Google Identity Services gửi ID token tới `POST /api/auth/google`.
- `GET /api/auth/me` tải thông tin người dùng sau khi nhận F-Spark token.
- Zustand persist session trong localStorage với key `fspark-auth`.
- Trang `/login` responsive và dashboard placeholder sau khi đăng nhập.
- API client dùng chung tại `src/shared/lib/api-client.ts`.
