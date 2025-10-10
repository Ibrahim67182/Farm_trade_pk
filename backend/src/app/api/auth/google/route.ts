import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

import { db } from "../../../../../lib/db/db";        // Drizzle instance
import { users } from "../../../../../lib/db/schema"; // Users table
import { eq } from "drizzle-orm";
import type { InferModel } from "drizzle-orm";

export const runtime = "nodejs";

const GOOGLE_ANDROID_ID = process.env.AUTH_GOOGLE_ANDROID_ID!;
const GOOGLE_WEB_ID = process.env.AUTH_GOOGLE_WEB_ID!;
const JWT_SECRET = process.env.JWT_SECRET!;

const client = new OAuth2Client();

// Full user type
type UserRow = InferModel<typeof users>;

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: [GOOGLE_ANDROID_ID, GOOGLE_WEB_ID],
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return NextResponse.json({ error: "Invalid token payload" }, { status: 400 });
    }

    const { email, name, picture, sub } = payload;
    const googleId = sub;

    if (!email || !googleId) {
      return NextResponse.json({ error: "Missing email or Google ID" }, { status: 400 });
    }

    // ✅ Check if user exists
    let [user]: UserRow[] = await db.select().from(users).where(eq(users.googleId, googleId));

    // ✅ If not, insert then fetch full row
    if (!user) {
      const id = crypto.randomUUID();

      await db.insert(users).values({
        id,
        name: name || "Unknown",
        email,
        googleId,
        role: "user",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // fetch the inserted user
      [user] = await db.select().from(users).where(eq(users.id, id));
      console.log("🆕 New user created:", user.email);
    }

    // ✅ Create JWT for app
    const appToken = jwt.sign(
      { userId: user.id, email: user.email, name: user.name, picture },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return NextResponse.json({
      success: true,
      user: { name: user.name, email: user.email, picture },
      token: appToken,
    });
  } catch (error: any) {
    console.error("Google Auth Error:", error);
    return NextResponse.json(
      { error: "Invalid or expired token", details: error.message },
      { status: 401 }
    );
  }
}
