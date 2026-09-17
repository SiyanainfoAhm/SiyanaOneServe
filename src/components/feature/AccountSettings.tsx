/**
 * Profile name + password change. Email/in-app toggles persist on the user row
 * but do not gate ticket assignment / status emails.
 */
import { useState } from "react";
import Card, { CardHeader } from "@/components/base/Card";
import Button from "@/components/base/Button";
import Avatar from "@/components/base/Avatar";
import { notificationPrefs } from "@/mocks/consoleSettings";

export interface AccountProfile {
  name: string;
  role: string;
  email: string;
  designation: string;
  organization: string;
  organizationFull: string;
  initials: string;
  since: string;
  badgeLabel: string;
  accountType: string;
  accessLevel: string;
}

export interface AccountOrgMeta {
  code: string;
}

export interface AccountProject {
  code: string;
  name: string;
  status: string;
  requests: number;
}

interface AccountSettingsProps {
  profile: AccountProfile;
  orgMeta: AccountOrgMeta;
  projects: AccountProject[];
  notifyEmail?: boolean;
  notifyInApp?: boolean;
  lastSignIn?: string;
  onSaveProfile?: (name: string, notifyEmail: boolean, notifyInApp: boolean) => Promise<void>;
  onChangePassword?: (oldPassword: string, nextPassword: string) => Promise<void>;
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className="flex items-center gap-2 cursor-pointer"
    >
      <span className="text-xs text-foreground-600">{label}</span>
      <span
        className={`relative h-6 w-10 rounded-full transition-colors ${checked ? "bg-primary-600" : "bg-background-300"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background-50 transition-transform ${checked ? "translate-x-4" : ""}`}
        ></span>
      </span>
    </button>
  );
}

export default function AccountSettings({
  profile,
  orgMeta,
  projects,
  notifyEmail = true,
  notifyInApp = true,
  lastSignIn,
  onSaveProfile,
  onChangePassword,
}: AccountSettingsProps) {
  const [name, setName] = useState(profile.name);
  const [prefs, setPrefs] = useState(
    notificationPrefs.map((pref) => ({
      id: pref.id,
      label: pref.label,
      description: pref.description,
      email: notifyEmail,
      inApp: notifyInApp,
    })),
  );
  const [banner, setBanner] = useState("");

  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");

  function flash(text: string) {
    setBanner(text);
    window.setTimeout(() => setBanner(""), 3000);
  }

  function togglePref(id: string, field: "email" | "inApp") {
    setPrefs((prev) => prev.map((pref) => (pref.id === id ? { ...pref, [field]: !pref[field] } : pref)));
  }

  function resetPw() {
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
    setPwError("");
  }

  async function handleSaveProfile() {
    try {
      if (onSaveProfile) {
        await onSaveProfile(name.trim() || profile.name, prefs.some((pref) => pref.email), prefs.some((pref) => pref.inApp));
      }
      flash("Profile updated successfully");
    } catch (err) {
      flash(err instanceof Error ? err.message : "Unable to update profile.");
    }
  }

  async function handleChangePassword() {
    if (!currentPw || !newPw || !confirmPw) {
      setPwError("Please fill in all the fields.");
      return;
    }
    if (newPw.length < 8) {
      setPwError("Your new password must be at least 8 characters long.");
      return;
    }
    if (newPw !== confirmPw) {
      setPwError("The new password and confirmation do not match.");
      return;
    }
    try {
      if (onChangePassword) {
        await onChangePassword(currentPw, newPw);
      }
      setPwOpen(false);
      resetPw();
      flash("Your password has been changed successfully.");
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Unable to change password.");
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <Card>
            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Avatar initials={profile.initials} size="lg" tone="primary" />
              <div className="min-w-0">
                <h2 className="font-heading text-lg font-bold text-foreground-950">{profile.name}</h2>
                <p className="mt-0.5 text-sm text-foreground-600">
                  {profile.designation} · {profile.organization}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent-200 bg-accent-50 px-2.5 py-0.5 text-[11px] font-label font-semibold text-accent-700">
                    <i className="ri-verified-badge-line text-[12px] leading-none"></i>
                    {profile.badgeLabel}
                  </span>
                  <span className="text-[11px] text-foreground-500">{profile.since}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Personal details"
              subtitle="You can edit your name — other details are managed by your organization"
            />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="account-name" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                  Full name
                </label>
                <input
                  id="account-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">Role</label>
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-background-200 bg-background-100 px-3">
                  <span className="text-sm text-foreground-600">{profile.role}</span>
                  <i className="ri-lock-2-line text-foreground-400 text-[14px] leading-none"></i>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">Official email</label>
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-background-200 bg-background-100 px-3">
                  <span className="text-sm text-foreground-600">{profile.email}</span>
                  <i className="ri-lock-2-line text-foreground-400 text-[14px] leading-none"></i>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">Designation</label>
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-background-200 bg-background-100 px-3">
                  <span className="truncate text-sm text-foreground-600">{profile.designation}</span>
                  <i className="ri-lock-2-line text-foreground-400 text-[14px] leading-none"></i>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setName(profile.name)}>
                Cancel
              </Button>
              <Button variant="primary" icon="ri-save-line" onClick={() => void handleSaveProfile()}>
                Save Changes
              </Button>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Notification preferences"
              subtitle="Choose how you are notified. These options are shared across both portals."
            />
            <ul className="mt-4 flex flex-col divide-y divide-background-100">
              {prefs.map((pref) => (
                <li key={pref.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground-900">{pref.label}</p>
                    <p className="mt-0.5 text-xs text-foreground-500">{pref.description}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-6">
                    <Switch checked={pref.email} onChange={() => togglePref(pref.id, "email")} label="Email" />
                    <Switch checked={pref.inApp} onChange={() => togglePref(pref.id, "inApp")} label="In-app" />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <h3 className="font-heading text-sm font-semibold text-foreground-950">Organization</h3>
            <div className="mt-3 flex items-start gap-3 rounded-lg border border-background-200 bg-background-100 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary-600">
                <i className="ri-building-2-line text-[20px] leading-none text-background-50"></i>
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground-900">{profile.organization}</p>
                <p className="text-[11px] text-foreground-500">{profile.organizationFull}</p>
              </div>
            </div>
            <dl className="mt-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <dt className="text-xs text-foreground-500">Organization code</dt>
                <dd className="font-mono text-xs font-medium text-foreground-900">{orgMeta.code}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-foreground-500">Account type</dt>
                <dd className="text-xs font-medium text-foreground-900">{profile.accountType}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-xs text-foreground-500">Access level</dt>
                <dd className="text-xs font-medium text-foreground-900">{profile.accessLevel}</dd>
              </div>
            </dl>
          </Card>

          <Card>
            <h3 className="font-heading text-sm font-semibold text-foreground-950">Projects</h3>
            <ul className="mt-3 flex flex-col gap-2">
              {projects.map((project) => (
                <li
                  key={project.code}
                  className="flex items-center gap-3 rounded-md border border-background-200 bg-background-50 px-3 py-2.5"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-background-100 text-foreground-600">
                    <i className="ri-folders-line text-[16px] leading-none"></i>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground-900">{project.name}</p>
                    <p className="text-[11px] text-foreground-500">{project.requests} requests</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-label font-semibold text-accent-700">
                    {project.status}
                  </span>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <h3 className="font-heading text-sm font-semibold text-foreground-950">Security</h3>
            <p className="mt-0.5 text-xs text-foreground-500">Protect your account</p>
            <div className="mt-3">
              <Button variant="outline" size="sm" fullWidth icon="ri-lock-password-line" onClick={() => setPwOpen(true)}>
                Change Password
              </Button>
            </div>
            <div className="mt-3 flex items-start gap-2.5 rounded-md border border-background-200 bg-background-100 p-3">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center">
                <i className="ri-history-line text-[15px] leading-none text-foreground-500"></i>
              </span>
              <p className="text-[11px] leading-relaxed text-foreground-600">
                Last signed in {lastSignIn || "from a recognised device"}.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {pwOpen ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-foreground-950/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-lg border border-background-200 bg-background-50">
            <div className="flex items-center justify-between border-b border-background-200 px-5 py-4">
              <div>
                <h3 className="font-heading text-[15px] font-semibold text-foreground-950">Change Password</h3>
                <p className="mt-0.5 text-xs text-foreground-500">Use at least 8 characters</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPwOpen(false);
                  resetPw();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-md text-foreground-500 transition-colors hover:bg-background-100 hover:text-foreground-900 cursor-pointer"
                aria-label="Close"
              >
                <i className="ri-close-line text-[18px] leading-none"></i>
              </button>
            </div>

            <div className="flex flex-col gap-4 px-5 py-5">
              <div>
                <label htmlFor="pw-current" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                  Current password
                </label>
                <input
                  id="pw-current"
                  type="password"
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label htmlFor="pw-new" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                  New password
                </label>
                <input
                  id="pw-new"
                  type="password"
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>
              <div>
                <label htmlFor="pw-confirm" className="mb-1.5 block text-xs font-label font-semibold text-foreground-800">
                  Confirm new password
                </label>
                <input
                  id="pw-confirm"
                  type="password"
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-400 focus:ring-2 focus:ring-primary-100"
                />
              </div>

              {pwError ? (
                <p className="flex items-start gap-1.5 rounded-md border border-[oklch(var(--status-danger)/0.3)] bg-[oklch(var(--status-danger)/0.06)] px-3 py-2 text-[11px] text-[oklch(var(--status-danger))]">
                  <i className="ri-error-warning-line mt-0.5 text-[14px] leading-none"></i>
                  {pwError}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-background-200 px-5 py-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setPwOpen(false);
                  resetPw();
                }}
              >
                Cancel
              </Button>
              <Button variant="primary" icon="ri-check-line" onClick={() => void handleChangePassword()}>
                Update Password
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {banner ? (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-lg border border-background-200 bg-foreground-950 px-4 py-3 shadow-lg">
          <span className="flex h-4 w-4 items-center justify-center">
            <i className="ri-checkbox-circle-fill text-[16px] leading-none text-accent-400"></i>
          </span>
          <span className="text-sm font-medium text-background-50">{banner}</span>
        </div>
      ) : null}
    </>
  );
}