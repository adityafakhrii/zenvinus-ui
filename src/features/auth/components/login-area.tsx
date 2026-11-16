import React, { useEffect, useRef, useState } from 'react';
import type { ClipboardEvent, FormEvent, KeyboardEvent } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import Logo from '@assets/img/logo/logo.png';
import { Button, TextInput, cn } from '@/components/ui';
import { useT } from '@/i18n';
import { SESSION_QUERY_KEY } from '../auth-provider';
import { sendVerificationOtp, signInEmailOtp, signInSocial } from '../services/auth-api';
import { IS_DEV_AUTH_BYPASS, saveDevSession } from '../services/dev-session';
import type { SocialProvider } from '../types/session';

const returnPath = (next: string | string[] | undefined): string => {
  if (typeof next !== 'string' || !next.startsWith('/') || typeof window === 'undefined') return '/dashboard';
  try {
    const url = new URL(next, window.location.origin);
    return url.origin === window.location.origin ? `${url.pathname}${url.search}${url.hash}` : '/dashboard';
  } catch {
    return '/dashboard';
  }
};

const OTP_LENGTH = 6;
const RESEND_SECONDS = 30;

type LoginStep = 'email' | 'otp';

const messageOf = (err: unknown): string => (err instanceof Error ? err.message : '');

function GoogleMark() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function GitHubMark() {
  return (
    <svg className="h-4 w-4 shrink-0 fill-current" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

/**
 * Calm sign-in card over Zenvinus canvas supporting Google/GitHub + email OTP and local dev bypass.
 */
const LoginArea = () => {
  const router = useRouter();
  const { t } = useT();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [resendIn, setResendIn] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
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
    setError('');
    if (IS_DEV_AUTH_BYPASS) {
      completeDevLogin(email);
      return;
    }
    setBusy(true);
    try {
      await sendVerificationOtp(email.trim());
      setCode(Array(OTP_LENGTH).fill(''));
      setResendIn(RESEND_SECONDS);
      setStep('otp');
    } catch (err) {
      setError(t(messageOf(err) || 'Failed to send the code. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    if (resendIn > 0 || busy) return;
    setError('');
    setBusy(true);
    try {
      await sendVerificationOtp(email.trim());
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      setError(t(messageOf(err) || 'Failed to resend the code.'));
    } finally {
      setBusy(false);
    }
  };

  const verifyAndContinue = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signInEmailOtp(email.trim(), code.join(''));
      queryClient.invalidateQueries({ queryKey: ['auth', 'session'] });
      router.push(returnPath(router.query.next));
    } catch (err) {
      setError(t(messageOf(err) || 'Invalid or expired code. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider: SocialProvider) => {
    setError('');
    if (IS_DEV_AUTH_BYPASS) {
      completeDevLogin(`${provider}@zenvinus.local`);
      return;
    }
    try {
      await signInSocial(provider, `${window.location.origin}${returnPath(router.query.next)}`);
    } catch (err) {
      setError(t(messageOf(err) || 'Failed to start {provider} sign-in.', { provider }));
    }
  };

  const setDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    setCode((prev) => prev.map((c, i) => (i === index ? digit : c)));
    if (digit && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const onDigitKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const onDigitPaste = (e: ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH).split('');
    if (!digits.length) return;
    setCode((prev) => prev.map((c, i) => digits[i] ?? c));
    otpRefs.current[Math.min(digits.length, OTP_LENGTH - 1)]?.focus();
  };

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-10 sm:px-6">
      <div className="mb-6 w-full max-w-[440px]">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.6} />
          <span>{t('Back To Home')}</span>
        </Link>
      </div>

      <div className="w-full max-w-[440px] rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-6 shadow-[0_8px_24px_rgba(2,6,38,0.06)] sm:p-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" aria-label={t('Zenvinus home')} className="mb-5 inline-flex items-center">
            <Image src={Logo} alt="Zenvinus" priority className="h-7 w-auto object-contain" />
          </Link>
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink">
            {t('Welcome {back}', { back: <span className="text-teal-ink">{t('Back')}</span> })}
          </h1>
          <p className="mt-2 mb-0 text-[13px] leading-relaxed text-ink-secondary">
            {t('Sign in or create your account with a one-time code — no password needed')}
          </p>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            block
            disabled={busy}
            onClick={() => social('google')}
            leftIcon={<GoogleMark />}
          >
            {t('Continue with {provider}', { provider: 'Google' })}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            block
            disabled={busy}
            onClick={() => social('github')}
            leftIcon={<GitHubMark />}
          >
            {t('Continue with {provider}', { provider: 'GitHub' })}
          </Button>
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-ink-muted">
          <span className="h-px flex-1 bg-line-subtle" aria-hidden="true" />
          <span>{t('or continue with email')}</span>
          <span className="h-px flex-1 bg-line-subtle" aria-hidden="true" />
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-tone-red-fg/25 bg-tone-red-bg/50 px-3.5 py-2.5 text-xs font-medium text-tone-red-ink"
          >
            {error}
          </div>
        )}

        {step === 'email' ? (
          <form onSubmit={sendCode} method="POST" noValidate={IS_DEV_AUTH_BYPASS} className="flex flex-col gap-3.5">
            <TextInput
              name="email"
              type="email"
              placeholder={t('Email address*')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required={!IS_DEV_AUTH_BYPASS}
              autoComplete="email"
              leftAddon={<Mail className="h-4 w-4" strokeWidth={1.5} />}
            />
            <Button type="submit" variant="primary" size="lg" block loading={busy}>
              {busy ? t('Sending…') : t('Send Verification Code')}
            </Button>
          </form>
        ) : (
          <form onSubmit={verifyAndContinue} method="POST" className="flex flex-col gap-4">
            <p className="m-0 text-center text-[13px] leading-relaxed text-ink-secondary">
              {t('We sent a {length}-digit code to {email}', {
                length: OTP_LENGTH,
                email: <strong className="font-semibold text-ink">{email}</strong>,
              })}{' '}
              <button
                type="button"
                onClick={() => setStep('email')}
                className="font-medium text-teal-ink hover:underline cursor-pointer"
              >
                {t('Change')}
              </button>
            </p>

            <div className="flex items-center justify-center gap-2" onPaste={onDigitPaste}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    otpRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={1}
                  value={digit}
                  autoFocus={index === 0}
                  onChange={(e) => setDigit(index, e.target.value)}
                  onKeyDown={(e) => onDigitKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  aria-label={t('Digit {n}', { n: index + 1 })}
                  className={cn(
                    'h-12 w-11 rounded-[10px] border bg-surface text-center font-mono text-lg font-semibold text-ink tabular-nums transition-colors focus:outline-none focus:border-teal-ink focus:ring-3 focus:ring-teal-ink/15',
                    digit ? 'border-teal-ink/50' : 'border-line-input',
                  )}
                />
              ))}
            </div>

            <Button type="submit" variant="primary" size="lg" block loading={busy}>
              {busy ? t('Verifying…') : t('Verify & Continue')}
            </Button>

            <p className="m-0 text-center text-xs text-ink-muted">
              {t("Didn't receive the code?")}{' '}
              {resendIn > 0 ? (
                <span className="font-mono text-ink-secondary tabular-nums">
                  {t('Resend in {seconds}s', { seconds: resendIn })}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={resendCode}
                  disabled={busy}
                  className="font-medium text-teal-ink hover:underline cursor-pointer"
                >
                  {t('Resend Code')}
                </button>
              )}
            </p>
          </form>
        )}

        <div className="mt-6 flex items-center justify-center gap-1.5 rounded-xl bg-canvas px-3 py-2.5 text-center text-xs text-ink-muted">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-teal-ink" strokeWidth={1.6} />
          <span>
            {t('By continuing, you agree to our {terms} and {privacy}', {
              terms: (
                <a href="#" className="text-ink-secondary underline hover:text-ink">
                  {t('Terms of Service')}
                </a>
              ),
              privacy: (
                <a href="#" className="text-ink-secondary underline hover:text-ink">
                  {t('Privacy Policy')}
                </a>
              ),
            })}
          </span>
        </div>
      </div>
    </section>
  );
};

export default LoginArea;
