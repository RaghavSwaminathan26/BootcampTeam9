"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAccount } from "@/components/AccountProvider";
import styles from "@/styles/Login.module.css";

export default function Login() {
  const router = useRouter();
  const { user, loading, error: accountError, refresh } = useAccount();
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  //send the login or signup form to the backend
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const response = await fetch(creatingAccount ? "/api/users" : "/api/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to log in");
      setPassword("");
      await refresh();
      router.replace("/visited");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to connect. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  //clear the session and any account information on the page
  async function logout() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) throw new Error("Unable to log out. Please try again.");
      await refresh();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to connect");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <p className={styles.eyebrow}>Your dining journal</p>
        <h1>{user ? "Your account" : creatingAccount ? "Create an account" : "Welcome back"}</h1>
        {loading ? (
          <p role="status">Loading your account…</p>
        ) : user ? (
          <>
            <p>
              Logged in as <strong>{user.username}</strong>.
            </p>
            <Link href="/visited">View your restaurants →</Link>
            <button className={styles.primary} disabled={saving} onClick={logout}>
              {saving ? "Logging out…" : "Log out"}
            </button>
          </>
        ) : (
          <>
            <p className={styles.description}>
              {creatingAccount
                ? "Keep your favorite meals and your next stops in one place."
                : "Log in to pick up where you left off."}
            </p>
            {accountError && <p role="alert">{accountError}</p>}
            <form className={styles.form} onSubmit={handleSubmit}>
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                minLength={3}
                maxLength={30}
                pattern="[a-zA-Z0-9_]{3,30}"
                aria-describedby="username-help"
                disabled={saving}
              />
              <p id="username-help" className={styles.hint}>
                3–30 letters, numbers, or underscores. Usernames are not case-sensitive.
              </p>
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={creatingAccount ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                maxLength={128}
                aria-describedby="password-help"
                disabled={saving}
              />
              <p id="password-help" className={styles.hint}>
                Use 8–128 characters.
              </p>
              <button className={styles.primary} type="submit" disabled={saving}>
                {saving ? "Please wait…" : creatingAccount ? "Create account" : "Log in"}
              </button>
            </form>
            <button
              className={styles.switchButton}
              disabled={saving}
              onClick={() => {
                setCreatingAccount(!creatingAccount);
                setMessage("");
                setPassword("");
              }}
            >
              {creatingAccount ? "Already have an account? Log in" : "New here? Create an account"}
            </button>
          </>
        )}
        {message && (
          <p className={styles.error} role="alert">
            {message}
          </p>
        )}
      </section>
    </main>
  );
}
