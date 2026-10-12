import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RestaurantInput } from "@/types/restaurant";

const mocks = vi.hoisted(() => ({
  connectDB: vi.fn(),
  find: vi.fn(),
  create: vi.fn(),
}));

vi.mock("@/database/db", () => ({
  default: mocks.connectDB,
}));

vi.mock("@/database/restaurantSchema", () => ({
  default: {
    find: mocks.find,
    create: mocks.create,
  },
}));

import { GET, POST } from "./route";

describe("Restaurant API routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    mocks.find.mockResolvedValue([databaseRestaurant]);

    const response = await GET();

    expect(response.status).toBe(200);
    expect(mocks.connectDB).toHaveBeenCalledOnce();
    expect(mocks.find).toHaveBeenCalledWith({});

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
      error: "Invalid JSON",
    });
    expect(mocks.create).not.toHaveBeenCalled();
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

    mocks.create.mockResolvedValue({
      _id: { toString: () => "new-id-123" },
      ...restaurant,
    });

    const request = new Request("http://localhost/api/restaurants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(restaurant),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(restaurant);
    expect(await response.json()).toEqual({
      id: "new-id-123",
      ...restaurant,
    });
  });
});
