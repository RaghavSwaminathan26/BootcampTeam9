import { NextResponse } from "next/server";

const restaurants = [
  {
    id: 1,
    name: "The Golden Fork",
    cuisine: "American",
    location: "San Francisco, CA",
    rating: 4.6,
    imageURL: "/example1.jpeg",
    status: "visited",
  },
  {
    id: 2,
    name: "Pasta Palace",
    cuisine: "Italian",
    location: "New York, NY",
    rating: 4.8,
    imageURL: "/example2.jpeg",
    status: "want-to-visit",
  },
  {
    id: 3,
    name: "Sakura Sushi",
    cuisine: "Japanese",
    location: "Los Angeles, CA",
    rating: 4.7,
    imageURL: "/example3.jpeg",
    status: "want-to-visit",
  },
];

export async function GET() {
  return NextResponse.json(restaurants);
}
