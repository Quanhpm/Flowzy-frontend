import { AuthShowcase } from "./auth-showcase";
import { LoginForm } from "./login-form";

export function LoginPage() {
  return (
    <main className="grid min-h-svh grid-cols-[minmax(560px,1fr)_minmax(560px,1fr)] overflow-hidden bg-surface font-sans max-[1180px]:grid-cols-[minmax(500px,58%)_minmax(420px,42%)] max-[900px]:block max-[600px]:w-screen max-[600px]:max-w-screen">
      <LoginForm />
      <AuthShowcase />
    </main>
  );
}
