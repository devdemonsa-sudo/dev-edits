import { AppShell } from "@/components/app-shell";
import { ConfigurationRequired } from "@/components/configuration-required";
import { UploadClient } from "@/components/upload-client";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export default async function UploadPage() {
  const auth = await getAuthenticatedUser();

  if (!auth.configured) {
    return <ConfigurationRequired />;
  }

  return (
    <AppShell active="upload" email={auth.user.email}>
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Importação</span>
          <h1>Upload e conciliação CSV</h1>
        </div>
      </div>
      <UploadClient />
    </AppShell>
  );
}
