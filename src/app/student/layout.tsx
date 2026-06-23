import type { ReactNode } from "react";

import { AppShell } from "@/shared/components";

type StudentLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function StudentLayout({ children }: StudentLayoutProps) {
  return <AppShell role="STUDENT">{children}</AppShell>;
}
