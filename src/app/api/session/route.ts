import connectDB from "@/database/db";
import UserModel from "@/database/userSchema";
import { endSession, isSameOrigin, readCredentials, startSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

//log in to an existing account
export async function POST(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  const credentials = readCredentials(await request.json().catch(() => null));
  if (!credentials) return Response.json({ error: "Enter a valid username and password" }, { status: 400 });

  try {
    await connectDB();
    const user = await UserModel.findOne({ username: credentials.username }).select("+password");
    //use a dummy hash for missing users so both cases still check a password
    const stored = user?.password || `${"0".repeat(32)}:${"0".repeat(128)}`;
    const matches = await verifyPassword(credentials.password, stored);
    if (!user || !matches) return Response.json({ error: "Incorrect username or password" }, { status: 401 });
    await startSession(user._id.toString());
    return Response.json({ username: user.username });
  } catch {
    return Response.json({ error: "Failed to log in. Please try again." }, { status: 500 });
  }
}

//log out of the current account
export async function DELETE(request: Request) {
  if (!isSameOrigin(request)) return Response.json({ error: "Invalid request origin" }, { status: 403 });
  try {
    await endSession();
    return Response.json({ message: "Logged out" });
  } catch {
    return Response.json({ error: "Failed to log out. Please try again." }, { status: 500 });
  }
}
