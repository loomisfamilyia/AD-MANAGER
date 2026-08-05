import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

/**
 * Current auth session.
 *
 * `loading` starts true and matters: without it the app renders the login
 * screen for a frame on every refresh while Supabase restores the session from
 * storage, which reads as being logged out at random.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        if (!active) return;
        setSession(nextSession);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
