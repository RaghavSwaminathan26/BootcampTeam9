import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import VisitedRestaurants from "./VisitedRestaurants";

vi.mock("next/image", () => ({
  default: "img",
}));

const visitedRestaurant = {
  id: "507f1f77bcf86cd799439011",
  name: "The Tasting Room",
  cuisine: "Californian",
  location: "San Luis Obispo",
  status: "visited" as const,
  rating: 3,
};

const wantToVisitRestaurant = {
  id: "507f1f77bcf86cd799439012",
  name: "Future Bistro",
  cuisine: "French",
  location: "Paso Robles",
  status: "want-to-visit" as const,
};

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("VisitedRestaurants", () => {
  it("only displays restaurants marked as visited", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [visitedRestaurant, wantToVisitRestaurant],
    });
    vi.stubGlobal("fetch", fetchMock);

    render(<VisitedRestaurants />);

    expect(await screen.findByRole("heading", { name: "The Tasting Room" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Future Bistro" })).not.toBeInTheDocument();
  });

  it("persists and displays an updated rating after a star is selected", async () => {
    const updatedRestaurant = { ...visitedRestaurant, rating: 5 };
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: async () => [visitedRestaurant] })
      .mockResolvedValueOnce({ ok: true, json: async () => updatedRestaurant });
    vi.stubGlobal("fetch", fetchMock);

    render(<VisitedRestaurants />);
    await screen.findByRole("heading", { name: "The Tasting Room" });

    fireEvent.click(screen.getByRole("button", { name: "Set rating to 5 out of 5 stars" }));

    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith("/api/restaurants/507f1f77bcf86cd799439011/rating", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: 5 }),
      }),
    );
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Set rating to 5 out of 5 stars" })).toHaveAttribute(
        "aria-pressed",
        "true",
      ),
    );
  });
});
