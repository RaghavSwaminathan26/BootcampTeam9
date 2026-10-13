import { Types } from "mongoose";
import UserModel from "@/database/userSchema";
import { getCurrentUser, isSameOrigin } from "@/lib/auth";

type RouteContext = {
  params: { id: string };
};

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });

  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });
    const body = await request.json().catch(() => null);
    const rating = body?.rating;
    if (!/^[a-f0-9]{24}$/i.test(params.id)) {
      return Response.json({ error: "Invalid restaurant ID" }, { status: 400 });
    }
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return Response.json({ error: "Rating must be a whole number from 1 to 5" }, { status: 400 });
    }

    // Match the restaurant and its status together within the current account.
    const updatedUser = await UserModel.findOneAndUpdate(
      { _id: user._id, restaurants: { $elemMatch: { _id: new Types.ObjectId(params.id), status: "visited" } } },
      { $set: { "restaurants.$.rating": rating } },
      { new: true, runValidators: true },
    );
    const restaurant = updatedUser?.restaurants.find((item) => item._id.toString() === params.id.toLowerCase());
    if (!restaurant) return Response.json({ error: "Visited restaurant not found" }, { status: 404 });

    return Response.json({
      id: restaurant._id.toString(),
      name: restaurant.name,
      cuisine: restaurant.cuisine,
      location: restaurant.location,
      status: restaurant.status,
      rating: restaurant.rating,
      imageURL: restaurant.imageURL,
    });
  } catch {
    return Response.json({ error: "Failed to update restaurant rating" }, { status: 500 });
  }
}
