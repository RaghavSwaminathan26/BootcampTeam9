import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AccountProvider } from "@/components/AccountProvider";
import Home from "./page";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("shows collection counts alongside the ranked restaurants for a logged-in account", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => {
        if (url === "/api/users") return { username: "alice" };
        if (url === "/api/restaurants/visited-count") return { count: 1 };
        if (url === "/api/restaurants/want-to-visit-count") return { count: 0 };
        return [
          { id: "cafe", name: "Test Cafe", cuisine: "French", location: "Seattle", status: "visited", rating: 5 },
        ];
      },
    })),
  );
  render(
    <AccountProvider>
      <Home />
    </AccountProvider>,
  );
  expect(await screen.findByText("1 restaurant visited")).toBeInTheDocument();
  expect(await screen.findByText("0 restaurants to visit")).toBeInTheDocument();
  expect(await screen.findByRole("heading", { name: "Test Cafe" })).toBeInTheDocument();
});

it("requires login before loading restaurant data", async () => {
  const fetchMock = vi.fn().mockResolvedValue({ status: 401 });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <AccountProvider>
      <Home />
    </AccountProvider>,
  );
  expect(await screen.findByRole("link", { name: /Log in or sign up/ })).toBeInTheDocument();
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(fetchMock).toHaveBeenCalledWith("/api/users", { cache: "no-store" });
});
