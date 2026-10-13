import { getCurrentUser, isSameOrigin } from "@/lib/auth";
import UserModel from "@/database/userSchema";
import { ACHIEVEMENTS, earnedAchievements, progressFor } from "@/data/achievements";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });
    const earned = earnedAchievements(user.restaurants, user.achievements || []);
    // Atomic union preserves unlocks across concurrent requests and restaurant deletions.
    const updated = await UserModel.findOneAndUpdate(
      { _id: user._id },
      { $addToSet: { achievements: { $each: earned } } },
      { new: true },
    );
    if (!updated) return Response.json({ error: "Account not found" }, { status: 401 });
    return Response.json(
      {
        earned: updated.achievements,
        progress: Object.fromEntries(ACHIEVEMENTS.map((node) => [node.id, progressFor(node, user.restaurants)])),
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "Your atlas could not be loaded." }, { status: 500 });
  }
}
