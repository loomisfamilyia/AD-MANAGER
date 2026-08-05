import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ErrorNote, InfoNote, PlatformTag, Spinner } from "@/components/ui";
import { relativeTime } from "@/lib/format";
import { supabase } from "@/lib/supabase";
import { PLATFORMS, type Platform, type SyncRun } from "@/lib/types";

/**
 * Honest per-platform notes on what it takes to connect.
 *
 * The difficulty ratings are the point of this page. Two of these three
 * platforms gate API access behind approvals that can take days or be refused
 * outright, and knowing that up front is the difference between planning
 * around it and discovering it mid-launch.
 */
const SETUP: Record<
  Platform,
  { difficulty: string; tone: string; steps: string[]; caveat?: string }
> = {
  meta: {
    difficulty: "Straightforward",
    tone: "text-status-good",
    steps: [
      "Business Manager → Business settings → Users → System users → Add.",
      "Assign the system user to your ad account with full control.",
      "Generate a token with ads_read scope. Set it to never expire.",
      "Save it as the META_ACCESS_TOKEN function secret.",
    ],
    caveat:
      "No App Review needed as long as you're only reading your own ad accounts. That exemption is why this one is easy.",
  },
  google: {
    difficulty: "Approval required",
    tone: "text-status-warning",
    steps: [
      "Create a manager (MCC) account and link your ad account to it.",
      "API Center → generate a developer token.",
      "Apply for Basic Access, describing this internal reporting tool.",
      "Create OAuth credentials in Google Cloud and get a refresh token.",
      "Save all five values as function secrets.",
    ],
    caveat:
      "The Basic Access review is mandatory and takes days. Completing brand verification on the linked Cloud project can cut it to hours. Until it clears, use CSV import.",
  },
  reddit: {
    difficulty: "May not be granted",
    tone: "text-status-serious",
    steps: [
      "Reddit Ads Manager → Settings → API Access.",
      "Register an OAuth app and request Ads API access.",
      "Exchange for a refresh token; tokens expire hourly.",
      "Save the credentials as function secrets.",
    ],
    caveat:
      "Reddit allow-lists Ads API access informally, weighted toward higher-spend advertisers. A correctly configured app can still be refused. Plan on CSV import here and treat API access as a bonus.",
  },
};

export default function Connections() {
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Platform | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function load() {
    const { data, error: loadError } = await supabase
      .from("sync_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(30);
    if (loadError) setError(loadError.message);
    else setRuns((data ?? []) as SyncRun[]);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, []);

  async function runSync(platform: Platform) {
    setBusy(platform);
    setError(null);
    setNotice(null);

    const { data, error: invokeError } = await supabase.functions.invoke(
      `sync-${platform}`,
      { body: { days: 30 } }
    );

    if (invokeError) {
      setError(
        `${platform}: ${invokeError.message}. If the function isn't deployed yet, that's expected — see the setup steps below.`
      );
    } else {
      setNotice(
        typeof data?.message === "string"
          ? data.message
          : `${platform} sync finished.`
      );
    }

    setBusy(null);
    await load();
  }

  const latestFor = (platform: Platform) =>
    runs.find((run) => run.platform === platform);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink-primary dark:text-ink-primaryDark">
          Connections
        </h1>
        <p className="mt-0.5 text-sm text-ink-secondary dark:text-ink-secondaryDark">
          Read-only reporting pulls. Nothing here can change a campaign, a
          budget, or a bid.
        </p>
      </div>

      {error && <ErrorNote>{error}</ErrorNote>}
      {notice && <InfoNote>{notice}</InfoNote>}

      <InfoNote>
        None of this is required. The app works entirely on{" "}
        <Link className="underline" to="/import">
          manual entry and CSV import
        </Link>
        — connectors just save you the weekly download.
      </InfoNote>

      <div className="grid gap-4 lg:grid-cols-3">
        {PLATFORMS.map((platform) => {
          const setup = SETUP[platform];
          const latest = latestFor(platform);

          return (
            <section key={platform} className="card space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="font-medium text-ink-primary dark:text-ink-primaryDark">
                  <PlatformTag platform={platform} />
                </div>
                <span className={`text-xs font-medium ${setup.tone}`}>
                  {setup.difficulty}
                </span>
              </div>

              <div className="text-xs text-ink-secondary dark:text-ink-secondaryDark">
                Last sync:{" "}
                <span className="text-ink-primary dark:text-ink-primaryDark">
                  {latest ? relativeTime(latest.started_at) : "never"}
                </span>
                {latest?.status === "error" && (
                  <span className="ml-1 text-status-critical">
                    — failed
                  </span>
                )}
                {latest?.status === "success" && (
                  <span className="ml-1 text-ink-muted">
                    ({latest.rows_written} rows)
                  </span>
                )}
              </div>

              {latest?.message && (
                <p className="rounded bg-black/[0.03] p-2 text-xs text-ink-secondary dark:bg-white/5 dark:text-ink-secondaryDark">
                  {latest.message}
                </p>
              )}

              <button
                type="button"
                className="btn-secondary w-full"
                onClick={() => runSync(platform)}
                disabled={busy !== null}
              >
                {busy === platform ? "Syncing…" : "Sync last 30 days"}
              </button>

              <details className="text-xs">
                <summary className="cursor-pointer font-medium text-ink-secondary dark:text-ink-secondaryDark">
                  Setup steps
                </summary>
                <ol className="mt-2 list-inside list-decimal space-y-1 text-ink-secondary dark:text-ink-secondaryDark">
                  {setup.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {setup.caveat && (
                  <p className="mt-2 text-ink-muted">{setup.caveat}</p>
                )}
              </details>
            </section>
          );
        })}
      </div>

      <section className="card">
        <h2 className="mb-3 text-sm font-semibold text-ink-primary dark:text-ink-primaryDark">
          Recent sync activity
        </h2>
        {loading ? (
          <Spinner label="Loading sync history" />
        ) : runs.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No syncs have run yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-black/10 text-xs text-ink-secondary dark:border-white/10 dark:text-ink-secondaryDark">
                  <th scope="col" className="py-2 text-left font-medium">Platform</th>
                  <th scope="col" className="py-2 text-left font-medium">When</th>
                  <th scope="col" className="py-2 text-left font-medium">Result</th>
                  <th scope="col" className="py-2 text-right font-medium">Rows</th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    className="border-b border-black/5 last:border-0 dark:border-white/5"
                  >
                    <td className="py-2">
                      <PlatformTag platform={run.platform} />
                    </td>
                    <td className="py-2 text-ink-secondary dark:text-ink-secondaryDark">
                      {relativeTime(run.started_at)}
                    </td>
                    <td className="py-2">
                      <span
                        className={
                          run.status === "success"
                            ? "text-status-good"
                            : run.status === "error"
                              ? "text-status-critical"
                              : "text-ink-muted"
                        }
                      >
                        {run.status}
                      </span>
                      {run.message && (
                        <span className="ml-2 text-xs text-ink-muted">
                          {run.message}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right tabular">{run.rows_written}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
