import { useState, type FormEvent } from "react";
import { supabase, isConfigured } from "@/lib/supabase";
import { ErrorNote, InfoNote } from "@/components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) setError(signInError.message);
    setBusy(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-semibold text-ink-primary dark:text-ink-primaryDark">
          Loomis Ads Manager
        </h1>
        <p className="mt-1 text-sm text-ink-secondary dark:text-ink-secondaryDark">
          Staff access only.
        </p>

        {!isConfigured && (
          <div className="mt-4">
            <InfoNote>
              Supabase isn't configured yet. Copy <code>.env.example</code> to{" "}
              <code>.env</code> and fill in your project URL and anon key.
            </InfoNote>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="field"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>

          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="field"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <ErrorNote>{error}</ErrorNote>}

          <button type="submit" className="btn-primary w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
