import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import connectDB from "@/database/db";
import SessionModel from "@/database/sessionSchema";
import UserModel from "@/database/userSchema";

const cookieName = "tableaux-session";
const sessionLength = 60 * 60 * 24 * 7;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

//look up the current account using the cookie, never a username from the browser
export async function getCurrentUser() {
  const token = (await cookies()).get(cookieName)?.value;
  if (!token) return null;
  await connectDB();
  const session = await SessionModel.findOne({ token: tokenHash(token), expiresAt: { $gt: new Date() } });
  if (!session) return null;
  return UserModel.findById(session.userId);
}

export async function startSession(userId: string) {
  await endSession();
  const token = randomBytes(32).toString("hex");
  await SessionModel.create({
    token: tokenHash(token),
    userId,
    expiresAt: new Date(Date.now() + sessionLength * 1000),
  });
  (await cookies()).set(cookieName, token, { ...cookieOptions, maxAge: sessionLength });
}

//remove the session so the old cookie cannot be reused after logout
export async function endSession() {
  const token = (await cookies()).get(cookieName)?.value;
  if (token) {
    await connectDB();
    await SessionModel.deleteOne({ token: tokenHash(token) });
  }
  (await cookies()).set(cookieName, "", { ...cookieOptions, maxAge: 0 });
}

//browser requests that change data must come from this site
export function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return (!origin || origin === new URL(request.url).origin) && request.headers.get("sec-fetch-site") !== "cross-site";
}

export function readCredentials(body: unknown) {
  if (!body || typeof body !== "object" || !("username" in body) || !("password" in body)) return null;
  if (typeof body.username !== "string" || typeof body.password !== "string") return null;
  const username = body.username.trim().toLowerCase();
  const password = body.password;
  if (!/^[a-z0-9_]{3,30}$/.test(username) || password.length < 8 || password.length > 128) return null;
  return { username, password };
}
