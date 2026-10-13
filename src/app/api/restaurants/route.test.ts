import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RestaurantInput } from "@/types/restaurant";

const mocks = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  updateOne: vi.fn(),
}));

vi.mock("@/lib/auth", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/auth")>()),
  getCurrentUser: mocks.getCurrentUser,
}));
vi.mock("@/database/userSchema", () => ({ default: { updateOne: mocks.updateOne } }));

import { GET, POST } from "./route";

describe("Restaurant API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentUser.mockResolvedValue({ _id: "account-id", restaurants: [] });
    mocks.updateOne.mockResolvedValue({ matchedCount: 1 });
  });

  it("GET returns restaurants in the Restaurant format", async () => {
    const databaseRestaurant: RestaurantInput & {
      _id: { toString(): string };
    } = {
      _id: { toString: () => "abc123" },
      name: "Sushi Place",
      cuisine: "Japanese",
      location: "Seattle",
      status: "visited",
      rating: 5,
      imageURL: "https://example.com/sushi.jpg",
    };

    mocks.getCurrentUser.mockResolvedValue({ _id: "account-id", restaurants: [databaseRestaurant] });

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.getCurrentUser).toHaveBeenCalledOnce();

    expect(await response.json()).toEqual([
      {
        id: "abc123",
        name: "Sushi Place",
        cuisine: "Japanese",
        location: "Seattle",
        status: "visited",
        rating: 5,
        imageURL: "https://example.com/sushi.jpg",
      },
    ]);
  });

  it("POST returns 400 when given invalid JSON", async () => {
    const request = new Request("http://localhost/api/restaurants", {
      method: "POST",
      body: "{ invalid JSON",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Invalid restaurant",
    });
    expect(mocks.updateOne).not.toHaveBeenCalled();
  });

  it("POST creates and returns a valid Restaurant", async () => {
    const restaurant: RestaurantInput = {
      name: "Taco Town",
      cuisine: "Mexican",
      location: "Portland",
      status: "want-to-visit",
      rating: 4,
      imageURL: "https://example.com/tacos.jpg",
    };

    const request = new Request("http://localhost/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurant),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mocks.updateOne).toHaveBeenCalledWith(
      { _id: "account-id" },
      { $push: { restaurants: expect.objectContaining(restaurant) } },
      { runValidators: true },
    );
    expect(await response.json()).toEqual({
      id: expect.stringMatching(/^[a-f0-9]{24}$/),
      ...restaurant,
    });
  });
});
