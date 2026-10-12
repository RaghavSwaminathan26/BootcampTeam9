import connectDB from "@/database/db";
import RestaurantModel from "@/database/restaurantSchema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectDB();
    const count = await RestaurantModel.countDocuments({ status: "want-to-visit" });

    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ error: "Failed to fetch want-to-visit restaurant count" }, { status: 500 });
  }
}
