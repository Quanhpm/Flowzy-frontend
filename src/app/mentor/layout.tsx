import type { ReactNode } from "react";

import { AppShell } from "@/shared/components";

type MentorLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function MentorLayout({ children }: MentorLayoutProps) {
  return <AppShell role="MENTOR">{children}</AppShell>;
}
