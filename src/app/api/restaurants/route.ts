import connectDB from "@/database/db";
import { NextResponse } from "next/server";
import { Restaurant } from "@/types/restaurant";
import { m_restaurants } from "@/data/mockRestaurants";

export async function GET() {
  await connectDB();
  return NextResponse.json(m_restaurants, { status: 200 });
}

export async function POST(request: Request) {
  await connectDB();
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, cuisine, location, status, rating, imageURL } = body;

  if (
    typeof name !== "string" ||
    typeof cuisine !== "string" ||
    typeof location !== "string" ||
    (status !== "visited" && status !== "want-to-visit")
  ) {
    return NextResponse.json({ error: "name, cuisine, location, and a valid status are required" }, { status: 400 });
  }

  const newRestaurant: Restaurant = {
    id: m_restaurants.length ? Math.max(...m_restaurants.map((r) => r.id)) + 1 : 1,
    name,
    cuisine,
    location,
    status,
    rating,
    imageURL,
  };

  m_restaurants.push(newRestaurant);
  return NextResponse.json(newRestaurant, { status: 201 });
}
