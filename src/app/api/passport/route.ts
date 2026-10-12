import { getCurrentUser } from "@/lib/auth";
import { getUnlockedCuisines } from "@/data/cuisines";

export const dynamic = "force-dynamic";

// Read passport data only from the authenticated account, including older restaurants.
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });
    return Response.json(
      {
        unlockedCuisines: getUnlockedCuisines(user),
        restaurants: user.restaurants.map((restaurant) => ({
          id: restaurant._id.toString(),
          name: restaurant.name,
          cuisine: restaurant.cuisine,
          location: restaurant.location,
          status: restaurant.status,
        })),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Unable to load your passport. Please try again." }, { status: 500 });
  }
}
