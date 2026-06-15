import type { Metadata } from "next";

import { LoginPage } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Sign in | F-Spark",
  description: "Sign in to the F-Spark EXE project management system.",
};

export default function LoginRoute() {
  return <LoginPage />;
}
