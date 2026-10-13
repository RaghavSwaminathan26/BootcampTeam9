import { Types } from "mongoose";
import UserModel from "@/database/userSchema";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import { RestaurantInput, Restaurant } from "@/types/restaurant";

export const dynamic = "force-dynamic";

// Allow local images and the web image URLs supported by this app.
function validImageURL(value: unknown) {
  if (value === undefined || value === "") return true;
  if (typeof value !== "string" || value.length > 2048) return false;
  if (/^\/(?![\/\\])/.test(value) && !value.includes("\\")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

// Format the restaurant subdocument for the cards on the page.
function formatRestaurant(document: RestaurantInput & { _id: Types.ObjectId }): Restaurant {
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

// Get only the logged-in user's restaurants.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });
    return Response.json(user.restaurants.map(formatRestaurant), { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Failed to fetch restaurants" }, { status: 500 });
  }
}

// Add a restaurant inside the user's document.
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body))
      return Response.json({ error: "Invalid restaurant" }, { status: 400 });
    const { name, cuisine, location, status, rating, imageURL } = body;

    // Make sure the restaurant fields are provided and valid.
    if (
      [name, cuisine, location].some((value) => typeof value !== "string" || !value.trim() || value.length > 200) ||
      (status !== "visited" && status !== "want-to-visit") ||
      (rating !== undefined && (typeof rating !== "number" || !Number.isFinite(rating) || rating < 0 || rating > 5)) ||
      !validImageURL(imageURL)
    ) {
      return Response.json(
        {
          error:
            "Enter a name, cuisine, location, and valid status. Ratings must be between 0 and 5; images must use a local path or web URL.",
        },
        { status: 400 },
      );
    }

    const restaurant = {
      _id: new Types.ObjectId(),
      name: name.trim(),
      cuisine: cuisine.trim(),
      location: location.trim(),
      status,
      rating,
      imageURL,
    };
    // Push atomically so two additions cannot overwrite one another.
    const result = await UserModel.updateOne(
      { _id: user._id },
      { $push: { restaurants: restaurant } },
      { runValidators: true },
    );
    if (!result.matchedCount) return Response.json({ error: "Account not found" }, { status: 401 });
    return Response.json(formatRestaurant(restaurant), { status: 201 });
  } catch {
    return Response.json({ error: "Failed to add restaurant" }, { status: 500 });
  }
}

// Update or remove only a restaurant belonging to the current account.
async function changeRestaurant(request: Request, remove: boolean) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });

    const body = await request.json().catch(() => null);
    if (
      !body ||
      typeof body.id !== "string" ||
      !/^[a-f0-9]{24}$/i.test(body.id) ||
      (!remove && body.status !== "visited" && body.status !== "want-to-visit")
    ) {
      return Response.json({ error: "Invalid restaurant or status" }, { status: 400 });
    }

    const result = await UserModel.updateOne(
      { _id: user._id, "restaurants._id": new Types.ObjectId(body.id) },
      remove
        ? { $pull: { restaurants: { _id: new Types.ObjectId(body.id) } } }
        : { $set: { "restaurants.$.status": body.status } },
      { runValidators: true },
    );
    if (!result.matchedCount) return Response.json({ error: "Restaurant not found" }, { status: 404 });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ error: "Failed to update restaurant" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return changeRestaurant(request, false);
}

export async function DELETE(request: Request) {
  return changeRestaurant(request, true);
}
