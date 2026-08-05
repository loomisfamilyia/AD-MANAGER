import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { Spinner } from "@/components/ui";
import { useSession } from "@/lib/useSession";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Campaigns from "@/pages/Campaigns";
import Leads from "@/pages/Leads";
import Import from "@/pages/Import";
import Connections from "@/pages/Connections";
import SettingsPage from "@/pages/Settings";

export default function App() {
  const { session, loading } = useSession();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner label="Signing in" />
      </div>
    );
  }

  if (!session) return <Login />;

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="campaigns" element={<Campaigns />} />
        <Route path="leads" element={<Leads />} />
        <Route path="import" element={<Import />} />
        <Route path="connections" element={<Connections />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
