import connectDB from "@/database/db";
import RestaurantModel from "@/database/restaurantSchema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const count = await RestaurantModel.countDocuments({ status: "visited" });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Failed to fetch visited restaurant count" }, { status: 500 });
  }
}
