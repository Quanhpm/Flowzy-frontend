import type { Metadata } from "next";

import { LoginPage } from "@/modules/auth";

export const metadata: Metadata = {
  title: "Sign in | Flowzy",
  description: "Sign in to the Flowzy EXE project management system.",
};

export default function LoginRoute() {
  return <LoginPage />;
}
