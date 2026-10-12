import connectDB from "@/database/db";
import RestaurantModel from "@/database/restaurantSchema";
import type { Restaurant } from "@/types/restaurant";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  let rating: unknown;

  try {
    ({ rating } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!ObjectId.isValid(params.id)) {
    return NextResponse.json({ error: "Invalid restaurant ID" }, { status: 400 });
  }

  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be a whole number from 1 to 5" }, { status: 400 });
  }

  try {
    await connectDB();
    const restaurant = await RestaurantModel.findOneAndUpdate(
      { _id: params.id, status: "visited" },
      { rating },
      { new: true },
    );

    if (!restaurant) {
      return NextResponse.json({ error: "Visited restaurant not found" }, { status: 404 });
    }

    const updatedRestaurant: Restaurant = {
      id: restaurant._id.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      location: restaurant.location,
      status: restaurant.status,
      rating: restaurant.rating,
      imageURL: restaurant.imageURL,
    };

    return NextResponse.json(updatedRestaurant);
  } catch {
    return NextResponse.json({ error: "Failed to update restaurant rating" }, { status: 500 });
  }
}
