import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "../app/api/external-restaurants/route";

describe("External Restaurant API Tests", () => {
  beforeEach(() => {
    vi.stubEnv("GEOAPIFY_API_KEY", "test-api-key");
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  // Test 1: Successful API request
  it("returns restaurants when the API request succeeds", async () => {
    const mockData = {
      features: [
        {
          properties: {
            name: "Test Restaurant",
            formatted: "San Luis Obispo, CA",
            place_id: "12345",
          },
        },
      ],
    };

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockData,
    } as Response);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([
      {
        name: "Test Restaurant",
        location: "San Luis Obispo, CA",
        id: "12345",
      },
    ]);
  });

  // Test 2: Missing API key
  it("returns 500 when the API key is missing", async () => {
    vi.stubEnv("GEOAPIFY_API_KEY", "");

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe("API key is missing");
    expect(fetch).not.toHaveBeenCalled();
  });

  // Test 3: Failed API request
  it("returns 502 when Geoapify responds with an error", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
    } as Response);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(502);
    expect(data.error).toBe("Unable to retrieve restaurants");
  });
});
