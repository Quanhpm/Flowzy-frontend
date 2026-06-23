"use client";

import { ApiError } from "@/shared/lib";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { useGoogleLogin } from "../hooks/use-google-login";
import { useLogin } from "../hooks/use-login";
import type { AuthUser } from "../types/auth.types";
import { BrandLogo } from "./brand-logo";
import { GoogleSignInButton } from "./google-sign-in-button";
import styles from "./login.module.css";

const REMEMBERED_EMAIL_KEY = "fspark-remembered-email";

function getRememberedEmail() {
  return typeof window === "undefined"
    ? ""
    : localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? "";
}

type FormErrors = {
  email?: string;
  password?: string;
};

function getDefaultWorkspacePath(role: AuthUser["role"]) {
  if (role === "ADMIN") return "/admin/users";
  if (role === "MENTOR") return "/mentor/groups";
  return "/student/dashboard";
}

export function LoginForm() {
  const router = useRouter();
  const loginMutation = useLogin();
  const googleLoginMutation = useGoogleLogin();
  const [email, setEmail] = useState(getRememberedEmail);
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(
    () => getRememberedEmail().length > 0,
  );
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [formMessage, setFormMessage] = useState("");

  function validate() {
    const nextErrors: FormErrors = {};

    if (!email.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Password is required.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormMessage("");

    if (!validate()) return;

    try {
      const session = await loginMutation.mutateAsync({
        email: email.trim(),
        password,
      });

      if (rememberMe) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      router.replace(getDefaultWorkspacePath(session.user.role));
    } catch (error) {
      setFormMessage(
        error instanceof ApiError
          ? error.message
          : "Sign in failed. Please try again.",
      );
    }
  }

  async function handleGoogleCredential(idToken: string) {
    setFormMessage("");

    try {
      const session = await googleLoginMutation.mutateAsync(idToken);
      router.replace(getDefaultWorkspacePath(session.user.role));
    } catch (error) {
      setFormMessage(
        error instanceof ApiError
          ? error.message
          : "Google sign-in failed. Please try again.",
      );
    }
  }

  const isAuthenticating =
    loginMutation.isPending || googleLoginMutation.isPending;

  return (
    <section className={styles.formPanel}>
      <header className={styles.formHeader}>
        <BrandLogo />
        <Link className={styles.backLink} href="/">
          <ArrowLeft size={15} /> Back
        </Link>
      </header>

      <div className={styles.formCenter}>
        <div className={styles.formContent}>
          <span className={styles.loginIcon} aria-hidden="true">
            <Sparkles size={28} fill="currentColor" />
          </span>
          <h1>Welcome back!</h1>
          <p className={styles.subtitle}>
            Enter your email and password to continue.
          </p>

          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.fieldGroup}>
              <label className={styles.srOnly} htmlFor="email">
                Email
              </label>
              <div
                className={`${styles.inputShell} ${errors.email ? styles.inputError : ""}`}
              >
                <Mail size={20} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrors((current) => ({ ...current, email: undefined }));
                  }}
                />
              </div>
              {errors.email && <span className={styles.errorText}>{errors.email}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.srOnly} htmlFor="password">
                Password
              </label>
              <div
                className={`${styles.inputShell} ${errors.password ? styles.inputError : ""}`}
              >
                <LockKeyhole size={20} />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                />
                <button
                  className={styles.passwordToggle}
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <span className={styles.errorText}>{errors.password}</span>
              )}
            </div>

            <div className={styles.formOptions}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                />
                <span>Remember me</span>
              </label>
              <button
                className={styles.textButton}
                type="button"
                onClick={() =>
                  setFormMessage("Contact an administrator to reset your password.")
                }
              >
                Forgot password?
              </button>
            </div>

            {formMessage && (
              <div className={styles.formMessage} role="alert">
                {formMessage}
              </div>
            )}

            <button
              className={styles.submitButton}
              type="submit"
              disabled={isAuthenticating}
            >
              {loginMutation.isPending ? <span className={styles.spinner} /> : null}
              {loginMutation.isPending ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className={styles.divider}>
            <span>OR SIGN IN WITH</span>
          </div>

          {googleLoginMutation.isPending && (
            <div className={styles.googleStatus} role="status">
              <span className={styles.spinnerDark} /> Signing in with Google...
            </div>
          )}

          <GoogleSignInButton
            disabled={isAuthenticating}
            onCredential={handleGoogleCredential}
            onConfigurationError={setFormMessage}
          />

          <p className={styles.accountNote}>
            Accounts are provided by the university. <strong>Contact an administrator</strong>
          </p>
        </div>
      </div>

      <footer className={styles.formFooter}>
        <span>© 2026 F-Spark. All rights reserved.</span>
        <div>
          <a href="#privacy">Privacy Policy</a>
          <span>•</span>
          <a href="#terms">Terms of Use</a>
        </div>
      </footer>
    </section>
  );
}
