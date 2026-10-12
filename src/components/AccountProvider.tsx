"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/RestaurantsList.module.css";

type Account = { username: string };
const AccountContext = createContext<{
  user: Account | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
}>({ user: null, loading: true, error: "", refresh: async () => {} });

export function AccountProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  //check the session when the app first opens
  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      if (response.status === 401) setUser(null);
      else if (!response.ok) throw new Error("Unable to load account");
      else setUser(await response.json());
    } catch {
      setUser(null);
      setError("We could not load your account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return <AccountContext.Provider value={{ user, loading, error, refresh }}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  return useContext(AccountContext);
}

//only mount the restaurant pages once an account is logged in
export function AccountGate({ children }: { children: React.ReactNode }) {
  const { user, loading, error, refresh } = useAccount();
  if (loading)
    return (
      <main className={styles.page}>
        <p role="status">Loading your account…</p>
      </main>
    );
  if (error)
    return (
      <main className={styles.page}>
        <p role="alert">{error}</p>
        <button onClick={refresh}>Try again</button>
      </main>
    );
  if (!user)
    return (
      <main className={styles.page}>
        <header className={styles.intro}>
          <h1>Your dining journal</h1>
        </header>
        <p>Log in or create an account to save your restaurants.</p>
        <Link href="/login">Log in or sign up →</Link>
      </main>
    );
  return <>{children}</>;
}
