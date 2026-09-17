/**
 * Government profile / password / notification prefs.
 */
import ClientLayout from "@/pages/client/components/ClientLayout";
import ClientPageHeader from "@/pages/client/components/ClientPageHeader";
import AccountSettings from "@/components/feature/AccountSettings";
import { useAuth } from "@/context/AuthContext";
import { useAppData } from "@/context/AppDataContext";
import { api } from "@/services/api";
import { projectNamesOf } from "@/utils/liveStats";

export default function ClientProfilePage() {
  const { user, setUser, refreshUser } = useAuth();
  const { projects, tickets } = useAppData();

  if (!user) return null;

  const assigned = projectNamesOf(user.projects as Array<string | { name: string }>);
  const accountProjects = projects
    .filter((project) => assigned.length === 0 || assigned.includes(project.name))
    .map((project) => ({
      code: project.code,
      name: project.name,
      status: project.status,
      requests: tickets.filter((ticket) => ticket.project === project.name).length,
    }));

  return (
    <ClientLayout>
      <ClientPageHeader
        title="Profile"
        subtitle="Your details, organization and communication preferences."
        breadcrumb={[{ label: "Dashboard", to: "/client/dashboard" }, { label: "Profile" }]}
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
            badgeLabel: "Government account",
            accountType: user.role,
            accessLevel: "Assigned projects",
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
    </ClientLayout>
  );
}
