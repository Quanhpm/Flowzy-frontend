"use client";

import Script from "next/script";
import { useCallback, useRef, useState } from "react";

import styles from "./login.module.css";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_HOSTED_DOMAIN = process.env.NEXT_PUBLIC_GOOGLE_HOSTED_DOMAIN;

type GoogleSignInButtonProps = {
  disabled?: boolean;
  onCredential: (idToken: string) => void;
  onConfigurationError: (message: string) => void;
};

export function GoogleSignInButton({
  disabled = false,
  onCredential,
  onConfigurationError,
}: GoogleSignInButtonProps) {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const initializeGoogle = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      onConfigurationError(
        "Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
      );
      return;
    }

    if (!window.google || !buttonContainerRef.current) return;

    window.__fsparkGoogleCredentialHandler = (response) => {
      if (response.credential) onCredential(response.credential);
    };

    if (!window.__fsparkGoogleInitialized) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: (response) =>
          window.__fsparkGoogleCredentialHandler?.(response),
        auto_select: false,
        cancel_on_tap_outside: true,
        hd: GOOGLE_HOSTED_DOMAIN || undefined,
        ux_mode: "popup",
        use_fedcm_for_button: true,
      });
      window.__fsparkGoogleInitialized = true;
    }

    const container = buttonContainerRef.current;
    container.replaceChildren();
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "left",
      locale: "en",
      width: Math.min(
        400,
        Math.floor(container.getBoundingClientRect().width),
      ),
    });
    setIsReady(true);
  }, [onConfigurationError, onCredential]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <button
        className={styles.googleButton}
        type="button"
        onClick={() =>
          onConfigurationError(
            "Google sign-in is not configured. Add NEXT_PUBLIC_GOOGLE_CLIENT_ID.",
          )
        }
      >
        <span className={styles.googleMark}>G</span>
        Google Workspace
      </button>
    );
  }

  return (
    <div
      className={`${styles.googleButtonShell} ${disabled ? styles.googleButtonDisabled : ""}`}
      aria-busy={!isReady || disabled}
    >
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onReady={initializeGoogle}
        onError={() =>
          onConfigurationError(
            "Google sign-in could not be loaded. Check your connection and try again.",
          )
        }
      />
      <div ref={buttonContainerRef} className={styles.googleButtonContainer} />
      {!isReady && (
        <div className={styles.googleButtonLoading}>
          <span className={styles.spinnerDark} /> Loading Google sign-in...
        </div>
      )}
      {disabled && <span className={styles.googleButtonBlocker} />}
    </div>
  );
}
