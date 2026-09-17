/**
 * Staff profile / password / notification prefs.
 */
import ConsoleLayout from "@/pages/console/components/ConsoleLayout";
import PageHeader from "@/pages/console/components/PageHeader";
import AccountSettings from "@/components/feature/AccountSettings";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import { projectNamesOf } from "@/utils/liveStats";

export default function SettingsPage() {
  const { user, setUser, refreshUser } = useAuth();
  const { projects, tickets } = useAppData();

  if (!user) return null;

  const accountProjects = (user.is_console ? projects : projects.filter((project) => projectNamesOf(user.projects as Array<string | { name: string }>).includes(project.name))).map((project) => ({
    code: project.code,
    name: project.name,
    status: project.status,
    requests: tickets.filter((ticket) => ticket.project === project.name).length,
  }));

  return (
    <ConsoleLayout>
      <PageHeader
        title="Settings"
        subtitle="Your account details, notification preferences and security"
      />

      <div className="mt-5">
        <AccountSettings
          profile={{
            name: user.full_name,
            role: user.role,
            email: user.email,
            designation: user.designation,
            organization: user.organization,
            organizationFull: user.organization_full,
            initials: user.initials,
            since: user.since,
            badgeLabel: "Operations account",
            accountType: user.role,
            accessLevel: "All organizations",
          }}
          orgMeta={{ code: user.organization.toUpperCase().slice(0, 8) }}
          projects={accountProjects}
          notifyEmail={user.notify_email}
          notifyInApp={user.notify_in_app}
          lastSignIn={user.last_active || "recently"}
          onSaveProfile={async (name, notifyEmail, notifyInApp) => {
            const next = await api.updateProfile(name, notifyEmail, notifyInApp);
            setUser(next);
            await refreshUser();
          }}
          onChangePassword={async (oldPassword, nextPassword) => {
            await api.changePassword(oldPassword, nextPassword);
          }}
        />
      </div>
    </ConsoleLayout>
  );
}
