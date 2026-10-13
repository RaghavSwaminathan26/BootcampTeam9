import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import TastingAtlas, { TastingAtlasProvider } from "./TastingAtlas";
const account = { username: "atlas-tester" };
vi.mock("./AccountProvider", () => ({ useAccount: () => ({ user: account }) }));
beforeEach(() => {
  const storage = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
  });
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      disconnect() {}
    },
  );
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
});
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});
it("opens all discoveries, zooms, selects a reward and restores body scrolling on close", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ earned: [], progress: {} }) }));
  render(
    <TastingAtlasProvider>
      <TastingAtlas />
    </TastingAtlasProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: /Your Atlas/ }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  expect(screen.getAllByRole("button", { name: /\. Locked$/ })).toHaveLength(55);
  expect(document.body.style.overflow).toBe("hidden");
  const beforeZoom = Number.parseInt(screen.getByText(/^\d+%$/).textContent!);
  fireEvent.click(screen.getByRole("button", { name: "Zoom in" }));
  expect(Number.parseInt(screen.getByText(/^\d+%$/).textContent!)).toBeGreaterThan(beforeZoom);
  fireEvent.click(screen.getByRole("button", { name: "The comfort table: table reward. Locked" }));
  expect(await screen.findByText(/not a redeemable coupon/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Close Tasting Atlas" }));
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(document.body.style.overflow).toBe("");
  await waitFor(() => expect(window.localStorage.getItem("tableaux-atlas-seen:atlas-tester")).toBe("[]"));
});
it("celebrates a newly earned discovery after a dining update without replaying it", async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({ ok: true, json: async () => ({ earned: [], progress: {} }) })
    .mockResolvedValue({ ok: true, json: async () => ({ earned: ["first-bite"], progress: { "first-bite": 1 } }) });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <TastingAtlasProvider>
      <TastingAtlas />
    </TastingAtlasProvider>,
  );
  await waitFor(() => expect(window.localStorage.getItem("tableaux-atlas-seen:atlas-tester")).toBe("[]"));
  fireEvent(window, new Event("dining-updated"));
  expect(await screen.findByText("The first bite")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /The first bite/ })).toHaveAttribute("href", "/login#atlas=first-bite");
  fireEvent.click(screen.getByRole("button", { name: "Dismiss achievement" }));
  fireEvent(window, new Event("dining-updated"));
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3));
  expect(screen.queryByText("The first bite")).not.toBeInTheDocument();
});

it("opens the linked achievement on the account page and animates Escape dismissal", async () => {
  window.history.replaceState(null, "", "/login#atlas=trail-2-reward");
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ earned: [], progress: {} }) }));
  render(
    <TastingAtlasProvider>
      <TastingAtlas />
    </TastingAtlasProvider>,
  );
  const dialog = await screen.findByRole("dialog");
  expect(screen.getByRole("heading", { name: "The spice route: table reward" })).toBeInTheDocument();
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(screen.getByRole("dialog")).toBeInTheDocument();
  await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  expect(window.location.hash).toBe("");
  expect(document.body.style.overflow).toBe("");
});
