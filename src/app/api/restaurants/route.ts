import { m_restaurants } from "@/data/mockRestaurants";
import { NextResponse } from "next/server";

/** Returns the current restaurant collection. */
export function GET() {
  return NextResponse.json(m_restaurants);
}
