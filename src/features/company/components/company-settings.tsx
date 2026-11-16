import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  Building2,
  Check,
  CreditCard,
  Layout,
  Lock,
  RotateCcw,
  Save,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Badge,
  Button,
  ConfirmDialog,
  CustomRadioGroup,
  CustomSelect,
  CustomSwitch,
  FileDropzone,
  TextInput,
  Textarea,
  ToastViewport,
} from '@/components/ui';
import type { RadioOption, SelectOption, ToastItem, ToastTone } from '@/components/ui';
import {
  DashboardFooter,
  DashboardHeader,
  navModeChanged,
  selectNavMode,
  selectSidebarCollapsed,
  sidebarCollapsedChanged,
} from '@/features/dashboard';
import type { NavMode } from '@/features/dashboard';
import { useT } from '@/i18n';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { getIndustries, getNotificationPrefs, getSecurity, getSettingsProfile } from '../data/company-settings';
import type { NotificationPref, SettingsProfile } from '../types/settings';

type ProfileForm = Pick<
  SettingsProfile,
  'name' | 'industry' | 'website' | 'about' | 'billingEmail' | 'phone' | 'address' | 'taxId'
>;

type DangerAction = 'transfer' | 'delete';

function pickForm(profile: SettingsProfile): ProfileForm {
  return {
    name: profile.name,
    industry: profile.industry,
    website: profile.website,
    about: profile.about,
    billingEmail: profile.billingEmail,
    phone: profile.phone,
    address: profile.address,
    taxId: profile.taxId,
  };
}

function initialsFrom(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'ZV';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}

interface SectionCardProps {
  icon: ReactNode;
  title: string;
  description?: string;
  badge?: ReactNode;
  danger?: boolean;
  children: ReactNode;
}

function SectionCard({ icon, title, description, badge, danger = false, children }: SectionCardProps) {
  return (
    <section
      className={
        danger
          ? 'rounded-2xl border border-tone-red-fg/25 bg-surface p-5 sm:p-6'
          : 'rounded-2xl border border-[rgba(8,13,53,0.08)] bg-surface p-5 sm:p-6 shadow-[0_1px_2px_rgba(2,6,38,0.03)]'
      }
    >
      <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-line-subtle pb-4">
        <div className="flex items-start gap-3">
          <span
            className={
              danger
                ? 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-tone-red-bg text-tone-red-fg'
                : 'flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-canvas text-ink'
            }
          >
            {icon}
          </span>
          <div className="min-w-0">
            <h2 className="m-0 text-base font-semibold text-ink leading-snug">{title}</h2>
            {description && <p className="mt-1 mb-0 text-[13px] text-ink-secondary">{description}</p>}
          </div>
        </div>
        {badge}
      </div>
      {children}
    </section>
  );
}

function TopbarLayoutPreview({ active }: { active: boolean }) {
  return (
    <div
      className={
        active
          ? 'rounded-lg border border-teal-ink/30 bg-surface p-2'
          : 'rounded-lg border border-line-subtle bg-canvas p-2'
      }
      aria-hidden="true"
    >
      <div className="flex h-4 items-center justify-between rounded bg-surface px-1.5 border border-line-subtle">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-sm bg-navy" />
          <span className="h-1 w-4 rounded-full bg-navy/70" />
          <span className="h-1 w-4 rounded-full bg-line" />
          <span className="h-1 w-4 rounded-full bg-line" />
        </div>
        <span className="h-2 w-2 rounded-full bg-teal" />
      </div>
      <div className="mt-1.5 flex h-2.5 items-center gap-1 rounded bg-surface/80 px-1.5 border border-line-subtle">
        <span className="h-1 w-6 rounded-full bg-ink-subtle/40" />
        <span className="h-1 w-6 rounded-full bg-line" />
      </div>
      <div className="mt-1.5 grid grid-cols-3 gap-1">
        <div className="col-span-2 h-8 rounded border border-line-subtle bg-surface" />
        <div className="h-8 rounded border border-line-subtle bg-surface" />
      </div>
    </div>
  );
}

function SidebarLayoutPreview({ active }: { active: boolean }) {
  return (
    <div
      className={
        active
          ? 'rounded-lg border border-teal-ink/30 bg-surface p-2'
          : 'rounded-lg border border-line-subtle bg-canvas p-2'
      }
      aria-hidden="true"
    >
      <div className="flex h-[62px] gap-1.5">
        <div className="flex w-7 shrink-0 flex-col gap-1 rounded border border-line-subtle bg-surface p-1">
          <span className="h-2 w-2 rounded-sm bg-navy" />
          <span className="mt-0.5 h-1.5 w-full rounded bg-teal/70" />
          <span className="h-1 w-4 rounded-full bg-line" />
          <span className="h-1 w-4 rounded-full bg-line" />
          <span className="mt-auto h-1 w-3 rounded-full bg-line" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex h-3 items-center justify-between rounded border border-line-subtle bg-surface px-1">
            <span className="h-1 w-8 rounded-full bg-line" />
            <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          </div>
          <div className="grid flex-1 grid-cols-3 gap-1">
            <div className="col-span-2 rounded border border-line-subtle bg-surface" />
            <div className="rounded border border-line-subtle bg-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Revamped Workspace Settings with live Dual-Mode Navigation Switcher (Top Navbar default / Sidebar)
 * and 100% custom Zenvinus UI components (Phase 2).
 */
export default function CompanySettings() {
  const { t } = useT();
  const dispatch = useAppDispatch();
  const navMode = useAppSelector(selectNavMode);
  const sidebarCollapsed = useAppSelector(selectSidebarCollapsed);

  const profile = useMemo(() => getSettingsProfile(), []);
  const industries = useMemo(() => getIndustries(), []);

  const [form, setForm] = useState<ProfileForm>(() => pickForm(profile));
  const [logoFiles, setLogoFiles] = useState<File[]>([]);
  const [notifications, setNotifications] = useState<NotificationPref[]>(() => getNotificationPrefs());
  const [security] = useState(() => getSecurity());
  const [twoFactor, setTwoFactor] = useState(() => getSecurity().twoFactor);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);
  const [confirmAction, setConfirmAction] = useState<DangerAction | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toastTimersRef = useRef<number[]>([]);

  useEffect(() => {
    const timers = toastTimersRef.current;
    return () => {
      for (const timer of timers) {
        window.clearTimeout(timer);
      }
    };
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, description?: string, tone: ToastTone = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, description, tone }]);
      const timer = window.setTimeout(() => dismissToast(id), 4000);
      toastTimersRef.current.push(timer);
    },
    [dismissToast],
  );

  const updateField = useCallback(<K extends keyof ProfileForm>(key: K, value: ProfileForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSavedNotice(false);
  }, []);

  const industryOptions: SelectOption[] = useMemo(
    () =>
      industries.map((item) => ({
        value: item,
        label: t(item),
      })),
    [industries, t],
  );

  const layoutOptions: RadioOption<NavMode>[] = useMemo(
    () => [
      {
        value: 'topbar',
        label: (
          <span className="inline-flex items-center gap-2">
            <span>{t('Top Navbar')}</span>
            <Badge tone="mint">{t('Default')}</Badge>
          </span>
        ),
        description: t('Default horizontal header bar with workspace switcher below.'),
        preview: <TopbarLayoutPreview active={navMode === 'topbar'} />,
      },
      {
        value: 'sidebar',
        label: t('Sidebar'),
        description: t('Collapsible left navigation rail with top search utility bar.'),
        preview: <SidebarLayoutPreview active={navMode === 'sidebar'} />,
      },
    ],
    [navMode, t],
  );

  const handleNavModeChange = (nextMode: NavMode) => {
    dispatch(navModeChanged(nextMode));
    pushToast(
      t('Navigation layout updated'),
      nextMode === 'sidebar' ? t('Sidebar') : t('Top Navbar'),
      'success',
    );
  };

  const handleSidebarCollapsedChange = (nextCollapsed: boolean) => {
    dispatch(sidebarCollapsedChanged(nextCollapsed));
    pushToast(
      t('Navigation layout updated'),
      nextCollapsed ? t('Collapse sidebar') : t('Expand sidebar'),
      'info',
    );
  };

  const toggleNotification = (id: string, enabled: boolean) => {
    setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, enabled } : item)));
    setSavedNotice(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    pushToast(t('All changes saved'), t('Changes saved locally for UI preview.'), 'success');
  };

  const handleReset = () => {
    setForm(pickForm(profile));
    setLogoFiles([]);
    setNotifications(getNotificationPrefs());
    setTwoFactor(security.twoFactor);
    setNewPassword('');
    setConfirmPassword('');
    setSavedNotice(false);
    pushToast(t('Reset'), t('Changes saved locally for UI preview.'), 'info');
  };

  const passwordMismatch = Boolean(confirmPassword && newPassword !== confirmPassword);

  const handleSecuritySave = () => {
    if (passwordMismatch) return;
    setNewPassword('');
    setConfirmPassword('');
    pushToast(t('All changes saved'), t('Changes saved locally for UI preview.'), 'success');
  };

  const handleDangerConfirm = () => {
    const actionLabel = confirmAction === 'delete' ? t('Delete Workspace') : t('Transfer Ownership');
    setConfirmAction(null);
    pushToast(actionLabel, t('Action previewed in local dummy mode.'), 'warning');
  };

  return (
    <>
      <DashboardHeader />

      <main className="min-h-screen bg-canvas pb-24 sm:pb-16 pt-6 sm:pt-8">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col gap-4 border-b border-line-subtle pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                href="/dashboard"
                className="mb-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-muted no-underline transition-colors hover:text-ink"
              >
                <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                <span>{t('Dashboard')}</span>
              </Link>
              <h1 className="m-0 text-[26px] font-semibold tracking-[-0.025em] text-ink sm:text-[28px] leading-tight">
                {t('Settings')}
              </h1>
              <p className="mt-1 mb-0 text-sm text-ink-secondary">
                {t('Company profile, notifications and security for your workspace.')}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {savedNotice && (
                <Badge tone="mint" dot>
                  {t('All changes saved')}
                </Badge>
              )}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                leftIcon={<RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />}
                onClick={handleReset}
              >
                {t('Reset')}
              </Button>
              <Button
                type="submit"
                form="zv-company-settings-form"
                variant="primary"
                size="sm"
                leftIcon={<Save className="h-4 w-4" strokeWidth={1.5} />}
              >
                {t('Save Changes')}
              </Button>
            </div>
          </div>

          {/* Main Asymmetric Grid */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            {/* Left Primary Stack */}
            <div className="flex flex-col gap-6">
              {/* Navigation & Appearance (Phase 2 Dual-Mode Switcher) */}
              <SectionCard
                icon={<Layout className="h-4 w-4" strokeWidth={1.5} />}
                title={t('Navigation & Appearance')}
                description={t(
                  'Choose how workspace navigation appears across your dashboard, studio, and task flows.',
                )}
                badge={
                  <Badge tone="blue" dot>
                    {navMode === 'sidebar' ? t('Sidebar') : t('Top Navbar')}
                  </Badge>
                }
              >
                <CustomRadioGroup<NavMode>
                  name="workspace-nav-mode"
                  label={t('Navigation mode')}
                  value={navMode}
                  onChange={handleNavModeChange}
                  variant="card"
                  options={layoutOptions}
                />

                <div className="mt-4 rounded-xl border border-line-subtle bg-canvas px-4 py-3">
                  <CustomSwitch
                    checked={sidebarCollapsed}
                    disabled={navMode !== 'sidebar'}
                    onChange={handleSidebarCollapsedChange}
                    label={t('Compact collapsed sidebar')}
                    description={t('Show icons only in the desktop sidebar rail (72px).')}
                    className="w-full"
                  />
                </div>
              </SectionCard>

              {/* Company Profile */}
              <SectionCard
                icon={<Building2 className="h-4 w-4" strokeWidth={1.5} />}
                title={t('Company Profile')}
                description={t('Shown on orders, invoices and your public workspace.')}
              >
                <form id="zv-company-settings-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <FileDropzone
                    label={t('Upload Company Logo')}
                    hint={t('PNG, JPG, or SVG up to 2 MB')}
                    accept="image/png,image/jpeg,image/svg+xml"
                    files={logoFiles}
                    onFilesChange={setLogoFiles}
                    buttonText={t('Choose file')}
                    dropHint={t('or drag and drop here')}
                  />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput
                      label={t('Company Name')}
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                    <CustomSelect
                      label={t('Industry')}
                      value={form.industry}
                      onChange={(val) => updateField('industry', val)}
                      options={industryOptions}
                      placeholder={t('Select industry')}
                    />
                    <TextInput
                      label={t('Website')}
                      type="url"
                      value={form.website}
                      onChange={(e) => updateField('website', e.target.value)}
                    />
                    <TextInput
                      label={t('Billing Email')}
                      type="email"
                      value={form.billingEmail}
                      onChange={(e) => updateField('billingEmail', e.target.value)}
                    />
                    <TextInput
                      label={t('Phone')}
                      type="tel"
                      value={form.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                    <TextInput
                      label={t('Tax ID (NPWP)')}
                      value={form.taxId}
                      onChange={(e) => updateField('taxId', e.target.value)}
                      className="font-mono"
                    />
                    <TextInput
                      label={t('Registered Address')}
                      value={form.address}
                      onChange={(e) => updateField('address', e.target.value)}
                      containerClassName="sm:col-span-2"
                    />
                    <Textarea
                      label={t('About')}
                      rows={3}
                      value={form.about}
                      onChange={(e) => updateField('about', e.target.value)}
                      containerClassName="sm:col-span-2"
                    />
                  </div>

                  <div className="mt-1 flex flex-wrap items-center justify-between gap-3 border-t border-line-subtle pt-4">
                    <span className="text-xs text-ink-muted">
                      {logoFiles.length > 0
                        ? t('{name} ready to upload', { name: logoFiles[0].name })
                        : t('Changes saved locally for UI preview.')}
                    </span>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      leftIcon={<Check className="h-4 w-4" strokeWidth={1.75} />}
                    >
                      {t('Save Changes')}
                    </Button>
                  </div>
                </form>
              </SectionCard>

              {/* Notifications */}
              <SectionCard
                icon={<Bell className="h-4 w-4" strokeWidth={1.5} />}
                title={t('Notifications')}
                description={t('Sent to {email}', {
                  email: form.billingEmail || t('your billing email'),
                })}
              >
                <div className="divide-y divide-line-subtle">
                  {notifications.map((pref) => (
                    <div key={pref.id} className="py-3.5 first:pt-0 last:pb-0">
                      <CustomSwitch
                        checked={pref.enabled}
                        onChange={(checked) => toggleNotification(pref.id, checked)}
                        label={t(pref.label)}
                        description={t(pref.desc)}
                        className="w-full"
                      />
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Security */}
              <SectionCard
                icon={<ShieldCheck className="h-4 w-4" strokeWidth={1.5} />}
                title={t('Security')}
                description={t('Last login {date}', { date: security.lastLogin })}
              >
                <div className="flex flex-col gap-4">
                  <TextInput label={t('Email (Owner login)')} value={security.email} disabled />

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <TextInput
                      label={t('New Password')}
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <TextInput
                      label={t('Confirm Password')}
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      error={passwordMismatch ? t('Passwords do not match.') : undefined}
                    />
                  </div>

                  <div className="rounded-xl border border-line-subtle bg-canvas px-4 py-3">
                    <CustomSwitch
                      checked={twoFactor}
                      onChange={(checked) => {
                        setTwoFactor(checked);
                        pushToast(
                          t('Two-factor authentication'),
                          t('Changes saved locally for UI preview.'),
                          'info',
                        );
                      }}
                      label={t('Two-factor authentication')}
                      description={t('Require an authenticator code for every owner sign-in.')}
                      className="w-full"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <span className="text-xs text-ink-muted">
                      {t('{count} active sessions — sign out of unused devices from your account menu', {
                        count: security.sessions,
                      })}
                    </span>
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      disabled={!newPassword || passwordMismatch}
                      leftIcon={<Lock className="h-3.5 w-3.5" strokeWidth={1.5} />}
                      onClick={handleSecuritySave}
                    >
                      {t('Save Changes')}
                    </Button>
                  </div>
                </div>
              </SectionCard>
            </div>

            {/* Right Rail */}
            <aside className="flex flex-col gap-6">
              <SectionCard
                icon={<Building2 className="h-4 w-4" strokeWidth={1.5} />}
                title={t('Workspace')}
                description={t('Identity & account facts')}
              >
                <div className="flex items-center gap-3 pb-4 border-b border-line-subtle">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-navy text-sm font-semibold text-white">
                    {initialsFrom(form.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-[15px] font-semibold text-ink">{form.name}</div>
                    <div className="mt-0.5 truncate text-xs text-ink-muted">{t(form.industry)}</div>
                  </div>
                </div>

                <dl className="m-0 divide-y divide-line-subtle text-sm">
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-ink-secondary font-normal">{t('Customer Success')}</dt>
                    <dd className="m-0 font-medium text-ink">{profile.manager}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-ink-secondary font-normal">{t('Workspace ID')}</dt>
                    <dd className="m-0 font-mono text-xs font-medium text-ink tabular-nums">WS-ZEN-2026</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-3">
                    <dt className="text-ink-secondary font-normal">{t('Navigation mode')}</dt>
                    <dd className="m-0">
                      <Badge tone="neutral">{navMode === 'sidebar' ? t('Sidebar') : t('Top Navbar')}</Badge>
                    </dd>
                  </div>
                </dl>

                <p className="mt-1 mb-4 text-xs text-ink-muted">
                  {t('Customer since {date}', { date: profile.memberSince })}
                </p>

                <div className="flex flex-col gap-2">
                  <Button
                    href="/dashboard/billing"
                    variant="secondary"
                    size="sm"
                    block
                    leftIcon={<CreditCard className="h-4 w-4" strokeWidth={1.5} />}
                  >
                    {t('Billing & Invoices')}
                  </Button>
                  <Button
                    href="/dashboard/team"
                    variant="secondary"
                    size="sm"
                    block
                    leftIcon={<Users className="h-4 w-4" strokeWidth={1.5} />}
                  >
                    {t('Team')}
                  </Button>
                </div>
              </SectionCard>

              <SectionCard
                danger
                icon={<AlertTriangle className="h-4 w-4" strokeWidth={1.5} />}
                title={t('Danger Zone')}
                description={t('Irreversible actions — escrowed funds must be fully released first.')}
              >
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    block
                    onClick={() => setConfirmAction('transfer')}
                  >
                    {t('Transfer Ownership')}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    block
                    onClick={() => setConfirmAction('delete')}
                  >
                    {t('Delete Workspace')}
                  </Button>
                </div>
              </SectionCard>
            </aside>
          </div>
        </div>
      </main>

      <ConfirmDialog
        open={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDangerConfirm}
        tone="danger"
        title={confirmAction === 'delete' ? t('Delete Workspace') : t('Transfer Ownership')}
        description={t('Are you sure you want to proceed with {action}? This action cannot be undone.', {
          action: confirmAction === 'delete' ? t('Delete Workspace') : t('Transfer Ownership'),
        })}
        confirmLabel={confirmAction === 'delete' ? t('Delete Workspace') : t('Transfer Ownership')}
        cancelLabel={t('Cancel')}
      />

      <ToastViewport items={toasts} onDismiss={dismissToast} />

      <DashboardFooter />
    </>
  );
}
