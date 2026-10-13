import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.GEOAPIFY_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "API key is missing" }, { status: 500 });
  }

  try {
    const url = new URL("https://api.geoapify.com/v2/places");

    url.searchParams.set("categories", "catering.restaurant");
    url.searchParams.set("filter", "circle:-120.6596,35.2828,5000");
    url.searchParams.set("limit", "10");
    url.searchParams.set("apiKey", apiKey);

    const response = await fetch(url.toString(), {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Unable to retrieve restaurants" }, { status: 502 });
    }

    const data = await response.json();

    const restaurants = data.features.map(
      (restaurant: {
        properties: {
          name?: string;
          formatted?: string;
          place_id?: string;
        };
      }) => ({
        name: restaurant.properties.name || "Unknown Restaurant",
        location: restaurant.properties.formatted || "Address unavailable",
        id: restaurant.properties.place_id,
      }),
    );

    return NextResponse.json(restaurants, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Unable to connect to Geoapify" }, { status: 502 });
  }
}
