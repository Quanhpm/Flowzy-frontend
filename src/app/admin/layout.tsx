import type { ReactNode } from "react";

import { AppShell } from "@/shared/components";

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AppShell role="ADMIN">{children}</AppShell>;
}
