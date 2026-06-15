import { AuthShowcase } from "./auth-showcase";
import { LoginForm } from "./login-form";
import styles from "./login.module.css";

export function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <LoginForm />
      <AuthShowcase />
    </main>
  );
}
