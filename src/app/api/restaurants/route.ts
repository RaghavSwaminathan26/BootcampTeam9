import connectDB from "@/database/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { RestaurantInput, Restaurant } from "@/types/restaurant";
import RestaurantModel from "@/database/restaurantSchema";

//format documents correctly
function formatRestaurant(document: {
  _id: { toString(): string };
  name: string;
  cuisine: string;
  location: string;
  status: "visited" | "want-to-visit";
  rating?: number;
  imageURL?: string;
}): Restaurant {
  return {
    id: document._id.toString(),
    name: document.name,
    cuisine: document.cuisine,
    location: document.location,
    status: document.status,
    rating: document.rating,
    imageURL: document.imageURL,
  };
}

//GET all restaurants
export async function GET() {
  try {
    await connectDB();

    //get the documents from the database and format them correctly
    const documents = await RestaurantModel.find({});
    const restaurants = documents.map(formatRestaurant);

    return NextResponse.json(restaurants, { status: 200 });
  } catch (error) {
    //failed to fetch restaurants from the database
    return NextResponse.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}

//add a new restaurant to the database
export async function POST(request: Request) {
  let body: RestaurantInput;

  //connect to the database
  try {
    await connectDB();
  } catch (error) {
    return NextResponse.json({ error: "Failed to connect to database" }, { status: 500 });
  }

  //get the request body
  try {
    body = (await request.json()) as RestaurantInput;
  } catch {
    //error 400 if the request body is not valid JSON
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, cuisine, location, status, rating, imageURL } = body;

  //make sure name, cuisine, location, and status are provided and valid
  if (
    typeof name !== "string" ||
    typeof cuisine !== "string" ||
    typeof location !== "string" ||
    (status !== "visited" && status !== "want-to-visit")
  ) {
    return NextResponse.json({ error: "name, cuisine, location, and a valid status are required" }, { status: 400 });
  }

  //extract the restaurant data so we can return it in the response
  const newRestaurant: RestaurantInput = {
    name,
    cuisine,
    location,
    status,
    rating,
    imageURL,
  };

  //create a new restaurant document in the database
  try {
    const document = await RestaurantModel.create(newRestaurant);
    return NextResponse.json(formatRestaurant(document), { status: 201 });
  } catch (error) {
    //error 500 if the restaurant could not be added to the database
    return NextResponse.json({ error: "Failed to add restaurant" }, { status: 500 });
  }
}
