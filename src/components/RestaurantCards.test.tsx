import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import RestaurantCards from "./RestaurantCards";

vi.mock("next/image", () => ({
  default: "img",
}));

const restaurant = {
  id: "restaurant-1",
  name: "The Tasting Room",
  cuisine: "Californian",
  location: "San Luis Obispo",
  status: "visited" as const,
  rating: 3,
};

describe("RestaurantCards", () => {
  it("shows an existing rating when the card is read-only", () => {
    render(<RestaurantCards restaurant={restaurant} />);

    expect(screen.getByLabelText("3 out of 5 stars")).toHaveTextContent("3");
  });

  it("sends the selected star value to the rating handler", async () => {
    const onRatingChange = vi.fn().mockResolvedValue(undefined);
    render(<RestaurantCards restaurant={restaurant} onRatingChange={onRatingChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Set rating to 5 out of 5 stars" }));

    await waitFor(() => expect(onRatingChange).toHaveBeenCalledWith(5));
  });

  it("shows a clear error when a rating cannot be saved", async () => {
    const onRatingChange = vi.fn().mockRejectedValue(new Error("Network unavailable"));
    render(<RestaurantCards restaurant={restaurant} onRatingChange={onRatingChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Set rating to 1 out of 5 stars" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("We could not save your rating. Please try again.");
  });
});

afterEach(() => {
  cleanup();
});
