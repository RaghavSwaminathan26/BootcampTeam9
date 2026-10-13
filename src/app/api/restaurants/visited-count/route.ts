import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const count = user?.restaurants.filter((restaurant) => restaurant.status === "visited").length ?? 0;
    return Response.json({ count }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Failed to fetch visited restaurant count" }, { status: 500 });
  }
}
