"use client";

import { useCallback, useEffect, useState } from "react";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { ProfileEditor } from "@/components/edit/ProfileEditor";

interface Session {
  wallet: string;
  fid?: number;
  method: "siwe" | "siwf";
}

export function MeClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      const { session } = (await res.json()) as { session: Session | null };
      setSession(session);
    } catch {
      setSession(null);
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
  }, []);

  if (!loaded) {
    return <p className="text-center text-mist-400">Checking your session…</p>;
  }

  return (
    <AuthProvider>
      {session ? (
        <ProfileEditor session={session} onLogout={logout} />
      ) : (
        <LoginPanel onLoggedIn={refresh} />
      )}
    </AuthProvider>
  );
}
