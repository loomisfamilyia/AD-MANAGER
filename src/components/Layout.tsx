import { NavLink, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/useTheme";

const NAV = [
  { to: "/", label: "Dashboard", end: true },
  { to: "/campaigns", label: "Campaigns", end: false },
  { to: "/leads", label: "Leads", end: false },
  { to: "/import", label: "Import", end: false },
  { to: "/connections", label: "Connections", end: false },
  { to: "/settings", label: "Settings", end: false },
];

export function Layout() {
  const [theme, toggleTheme] = useTheme();

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/10 bg-surface-light dark:border-white/10 dark:bg-surface-dark">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-ink-primary dark:text-ink-primaryDark">
              Loomis Ads
            </span>
            <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted dark:bg-white/10">
              Internal
            </span>
          </div>

          <nav className="flex flex-1 flex-wrap gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-2.5 py-1.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-100"
                      : "text-ink-secondary hover:bg-black/5 dark:text-ink-secondaryDark dark:hover:bg-white/5"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-md px-2 py-1.5 text-sm text-ink-secondary transition hover:bg-black/5 dark:text-ink-secondaryDark dark:hover:bg-white/5"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? "☀︎" : "☾"}
            </button>
            <button
              type="button"
              onClick={() => supabase.auth.signOut()}
              className="text-sm text-ink-secondary underline-offset-2 hover:underline dark:text-ink-secondaryDark"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
