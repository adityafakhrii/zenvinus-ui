import React, { useEffect, useRef, useState } from "react";
import type { ClipboardEvent, FormEvent, KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Logo from "@assets/img/logo/logo.png";
import { sendVerificationOtp, signInEmailOtp, signInSocial } from '../services/auth-api';
import { IS_DEV_AUTH_BYPASS, saveDevSession } from '../services/dev-session';
import { SESSION_QUERY_KEY } from '../auth-provider';
import type { SocialProvider } from '../types/session';
import { useQueryClient } from "@tanstack/react-query";
import { useT } from "@/i18n";

// WHY: Only same-site paths are followed after sign-in, so a crafted ?next= link cannot send users to another site.
// The browser parses the path (it drops tabs and newlines and reads backslashes as slashes), and the result must keep this origin
const returnPath = (next: string | string[] | undefined): string => {
  if (typeof next !== "string" || !next.startsWith("/") || typeof window === "undefined") return "/dashboard";
  try {
    const url = new URL(next, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : "/dashboard";
  } catch {
    return "/dashboard";
  }
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type LoginStep = "email" | "otp";

/** Message of a failed call (ApiError carries the server's message); empty when there is none */
const messageOf = (err: unknown): string => (err instanceof Error ? err.message : "");

const LoginArea = () => {
  const router = useRouter();
  const { t } = useT();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (resendIn <= 0) return undefined;
    const timer = setInterval(() => setResendIn((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendIn]);

  const completeDevLogin = (loginEmail?: string) => {
    const devSession = saveDevSession(loginEmail);
    queryClient.setQueryData(SESSION_QUERY_KEY, devSession);
    router.push(returnPath(router.query.next));
  };

  const sendCode = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    if (IS_DEV_AUTH_BYPASS) {
      completeDevLogin(email);
      return;
    }
    setBusy(true);
    try {
      await sendVerificationOtp(email.trim());
      setCode(Array(OTP_LENGTH).fill(""));
      setResendIn(RESEND_SECONDS);
      setStep("otp");
    } catch (err) {
      setError(t(messageOf(err) || "Failed to send the code. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    if (resendIn > 0 || busy) return;
    setError("");
    setBusy(true);
    try {
      await sendVerificationOtp(email.trim());
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(t(messageOf(err) || "Failed to resend the code."));
    } finally {
      setBusy(false);
    }
  };

  const verifyAndContinue = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await signInEmailOtp(email.trim(), code.join(""));
      queryClient.invalidateQueries({ queryKey: ["auth", "session"] });
      router.push(returnPath(router.query.next));
    } catch (err) {
      setError(t(messageOf(err) || "Invalid or expired code. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider: SocialProvider) => {
    setError("");
    if (IS_DEV_AUTH_BYPASS) {
      completeDevLogin(`${provider}@zenvinus.local`);
      return;
    }
    try {
      await signInSocial(provider, `${window.location.origin}${returnPath(router.query.next)}`);
    } catch (err) {
      setError(t(messageOf(err) || "Failed to start {provider} sign-in.", { provider }));
    }
  };

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    setCode((prev) => prev.map((c, i) => (i === index ? digit : c)));
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onDigitPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const digits = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH)
      .split("");
    if (!digits.length) return;
    setCode((prev) => prev.map((c, i) => digits[i] ?? c));
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <section className="edash-area zv-login-area">
      <div className="container">
        <div className="zv-login-card">
          <Link href="/" className="zv-login-logo" aria-label={t("Zenvinus home")}>
            <Image src={Logo} alt="Zenvinus" priority />
          </Link>
          <h4 className="zv-login-title">
            {t("Welcome {back}", { back: <span>{t("Back")}</span> })}
          </h4>
          <p className="zv-login-subtitle">
            {t("Sign in or create your account with a one-time code — no password needed")}
          </p>

          <button type="button" className="edash-btn-ghost zv-login-social" onClick={() => social("google")} disabled={busy}>
            <i className="fa-brands fa-google"></i>
            {t("Continue with {provider}", { provider: "Google" })}
          </button>
          <button type="button" className="edash-btn-ghost zv-login-social" onClick={() => social("github")} disabled={busy}>
            <i className="fa-brands fa-github"></i>
            {t("Continue with {provider}", { provider: "GitHub" })}
          </button>

          <div className="zv-login-divider">
            <span>{t("or continue with email")}</span>
          </div>

          {error && (
            <p className="zv-login-otp-hint" role="alert" style={{ color: "#dc3545" }}>
              {error}
            </p>
          )}

          {step === "email" ? (
            <form onSubmit={sendCode} method="POST" noValidate={IS_DEV_AUTH_BYPASS}>
              <div className="zv-login-phone">
                <input
                  name="email"
                  type="email"
                  className="edash-input"
                  placeholder={t("Email address*")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required={!IS_DEV_AUTH_BYPASS}
                  autoComplete="email"
                />
              </div>
              <button type="submit" className="edash-btn zv-login-submit" disabled={busy}>
                {busy ? t("Sending…") : t("Send Verification Code")}
              </button>
            </form>
          ) : (
            <form onSubmit={verifyAndContinue} method="POST">
              <p className="zv-login-otp-hint">
                {t("We sent a {length}-digit code to {email}", { length: OTP_LENGTH, email: <strong>{email}</strong> })}{" "}
                <button type="button" onClick={() => setStep("email")}>
                  {t("Change")}
                </button>
              </p>
              <div className="zv-login-otp" onPaste={onDigitPaste}>
                {code.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      otpRefs.current[index] = el;
                    }}
                    className="edash-input zv-login-otp-box"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    autoFocus={index === 0}
                    onChange={(e) => setDigit(index, e.target.value)}
                    onKeyDown={(e) => onDigitKeyDown(index, e)}
                    onFocus={(e) => e.target.select()}
                    aria-label={t("Digit {n}", { n: index + 1 })}
                  />
                ))}
              </div>
              <button type="submit" className="edash-btn zv-login-submit" disabled={busy}>
                {busy ? t("Verifying…") : t("Verify & Continue")}
              </button>
              <p className="zv-login-resend">
                {t("Didn't receive the code?")}{" "}
                {resendIn > 0 ? (
                  <span>{t("Resend in {seconds}s", { seconds: resendIn })}</span>
                ) : (
                  <button type="button" onClick={resendCode} disabled={busy}>
                    {t("Resend Code")}
                  </button>
                )}
              </p>
            </form>
          )}

          <p className="zv-login-terms">
            {t("By continuing, you agree to our {terms} and {privacy}", {
              terms: <a href="#">{t("Terms of Service")}</a>,
              privacy: <a href="#">{t("Privacy Policy")}</a>,
            })}
          </p>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;
