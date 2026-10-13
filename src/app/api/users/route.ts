import connectDB from "@/database/db";
import UserModel from "@/database/userSchema";
import { getCurrentUser, isSameOrigin, readCredentials, startSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";

export const dynamic = "force-dynamic";

//get the account that is currently logged in
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return Response.json({ error: "Please log in first" }, { status: 401 });
    return Response.json({ username: user.username }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ error: "Failed to load account" }, { status: 500 });
  }
}

//create a new user in the users collection and log them in
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const body = await request.json().catch(() => null);
  const credentials = readCredentials(body);
  if (!credentials) {
    return Response.json(
      { error: "Use a username with 3–30 letters, numbers, or underscores and a password with 8–128 characters" },
      { status: 400 },
    );
  }

  try {
    await connectDB();
    //make sure the unique username index exists before creating an account
    await UserModel.init();
    const password = await hashPassword(credentials.password);
    const user = await UserModel.create({ username: credentials.username, password, restaurants: [] });
    await startSession(user._id.toString());
    return Response.json({ username: user.username }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return Response.json({ error: "That username is already taken" }, { status: 409 });
    }
    return Response.json({ error: "Failed to create account. If it was created, try logging in." }, { status: 500 });
  }
}
