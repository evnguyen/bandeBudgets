import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// Get password from environment variables
const APP_PASSWORD = process.env.APP_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request) {
  try {
    const { password } = await request.json();

    // Check if password is provided
    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    // Check if APP_PASSWORD is configured
    if (!APP_PASSWORD) {
      console.error("APP_PASSWORD environment variable is not set");
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check if JWT_SECRET is configured
    if (!JWT_SECRET) {
      console.error("JWT_SECRET environment variable is not set");
      console.error("Available env vars:", Object.keys(process.env).filter(key => key.includes('JWT') || key.includes('APP')));
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const cookieStore = cookies();
    const clientIP = request.headers.get("x-forwarded-for") ||
                    request.headers.get("x-real-ip") ||
                    "unknown";

    // Get attempt count from cookie
    const attemptsKey = `auth_attempts_${clientIP.replace(/\./g, "_")}`;
    const attemptsCookie = cookieStore.get(attemptsKey);
    let attempts = 0;

    if (attemptsCookie) {
      attempts = parseInt(attemptsCookie.value) || 0;
    }

    // Check if too many attempts
    if (attempts >= 10) {
      return NextResponse.json(
        {
          message: "Too many failed attempts. Please try again later.",
          blocked: true
        },
        { status: 429 }
      );
    }

    // Verify password
    if (password === APP_PASSWORD) {
      // Password correct - create JWT token
      const token = jwt.sign(
        {
          authenticated: true,
          ip: clientIP,
          timestamp: Date.now(),
          sessionId: crypto.randomUUID()
        },
        JWT_SECRET,
        { expiresIn: '10y' }
      );

      const response = NextResponse.json(
        { message: "Authentication successful" },
        { status: 200 }
      );

      // Set JWT token in httpOnly cookie
      response.cookies.set("budget_auth", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 10 * 365 * 24 * 60 * 60, // 10 years (matches token expiration)
        path: "/",
      });

      // Clear attempt count on successful login
      response.cookies.set(attemptsKey, "0", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      return response;
    } else {
      // Password incorrect - increment attempts
      attempts += 1;

      const response = NextResponse.json(
        {
          message: `Invalid password. ${10 - attempts} attempts remaining.`,
          attemptsRemaining: 10 - attempts
        },
        { status: 401 }
      );

      // Set/update attempts cookie (expires in 1 hour)
      response.cookies.set(attemptsKey, attempts.toString(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 60 * 60, // 1 hour
        path: "/",
      });

      return response;
    }
  } catch (error) {
    console.error("Password verification error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
