import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const count = user?.restaurants.filter((restaurant) => restaurant.status === "want-to-visit").length ?? 0;
    return Response.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Failed to fetch want-to-visit restaurant count" }, { status: 500 });
  }
}
