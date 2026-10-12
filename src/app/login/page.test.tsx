import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AccountProvider } from "@/components/AccountProvider";
import Login from "./page";

const { replace } = vi.hoisted(() => ({ replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh: vi.fn() }) }));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it("logs in, refreshes the account, and opens the visited page", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ status: 401 })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ username: "alice" }) })
    .mockResolvedValueOnce({ ok: true, json: async () => ({ username: "alice" }) });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <AccountProvider>
      <Login />
    </AccountProvider>,
  );
  fireEvent.change(await screen.findByLabelText("Username"), { target: { value: "alice" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "test-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
  await waitFor(() => expect(replace).toHaveBeenCalledWith("/visited"));
  expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "alice", password: "test-password" }),
  });
  expect(await screen.findByText("alice")).toBeInTheDocument();
});

it("shows rejected credentials without navigating", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce({ status: 401 })
      .mockResolvedValueOnce({ ok: false, json: async () => ({ error: "Incorrect username or password" }) }),
  );
  render(
    <AccountProvider>
      <Login />
    </AccountProvider>,
  );
  fireEvent.change(await screen.findByLabelText("Username"), { target: { value: "alice" } });
  fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
  fireEvent.click(screen.getByRole("button", { name: "Log in" }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Incorrect username or password");
  expect(replace).not.toHaveBeenCalled();
});
