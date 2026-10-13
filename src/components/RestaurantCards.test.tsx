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
  vi.unstubAllGlobals();
});

it("preserves wishlist actions alongside ratings and locks actions while saving", async () => {
  let finishRating!: () => void;
  const onRatingChange = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finishRating = resolve;
      }),
  );
  const onRestaurantChanged = vi.fn();
  vi.stubGlobal("matchMedia", () => ({ matches: true }));
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  render(
    <RestaurantCards
      restaurant={restaurant}
      onRatingChange={onRatingChange}
      onRestaurantChanged={onRestaurantChanged}
    />,
  );
  fireEvent.click(screen.getByRole("button", { name: "Set rating to 5 out of 5 stars" }));
  expect(screen.getByRole("button", { name: /Star The Tasting Room/ })).toBeDisabled();
  expect(screen.getByRole("button", { name: /Remove The Tasting Room/ })).toBeDisabled();
  finishRating();
  await waitFor(() => expect(screen.getByRole("button", { name: /Star The Tasting Room/ })).toBeEnabled());
  fireEvent.click(screen.getByRole("button", { name: /Star The Tasting Room/ }));
  await waitFor(() => expect(onRestaurantChanged).toHaveBeenCalledWith({ ...restaurant, status: "want-to-visit" }));
  expect(fetchMock).toHaveBeenCalledWith("/api/restaurants", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: restaurant.id, status: "want-to-visit" }),
  });
});
