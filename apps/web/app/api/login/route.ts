import { NextResponse } from "next/server";
import { LocalDbController } from "@aether/db";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Please enter your email and password." },
        { status: 400 }
      );
    }

    const user = LocalDbController.getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User account not found." },
        { status: 401 }
      );
    }

    // Verify raw seeded password
    if (user.passwordHash !== password) {
      return NextResponse.json(
        { success: false, error: "Incorrect password. Please try again." },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      email: user.email,
      role: user.role,
      tenantSlug: user.tenantSlug || "default-tenant",
      planId: user.planId || "free",
      creditsBalance: user.creditsBalance || 2000
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Internal authentication error." },
      { status: 500 }
    );
  }
}
