import { beforeEach, describe, test, expect, vi } from "vitest";

const mocks = vi.hoisted(() => ({ getCurrentUser: vi.fn() }));
vi.mock("@/lib/auth", () => mocks);

import { GET as visitedCount } from "@/app/api/restaurants/visited-count/route";
import { GET as wishlistCount } from "@/app/api/restaurants/want-to-visit-count/route";

describe.each([
  ["visited", visitedCount, 2],
  ["want-to-visit", wishlistCount, 1],
] as const)("%s count", (_status, GET, count) => {
  beforeEach(() => vi.resetAllMocks());

  test("counts only matching restaurants from the current account", async () => {
    mocks.getCurrentUser.mockResolvedValue({
      restaurants: [{ status: "visited" }, { status: "want-to-visit" }, { status: "visited" }],
    });
    const response = await GET();
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ count });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  test("returns zero when logged out", async () => {
    mocks.getCurrentUser.mockResolvedValue(null);
    expect(await (await GET()).json()).toEqual({ count: 0 });
  });

  test("reports account lookup failures", async () => {
    mocks.getCurrentUser.mockRejectedValue(new Error("Database unavailable"));
    expect((await GET()).status).toBe(500);
  });
});
