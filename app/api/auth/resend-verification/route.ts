import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { v4 as uuidv4 } from "uuid";
import { normalizeEmail } from "@/utils/formatters";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Return a generic message to avoid disclosing whether an email is registered
      return NextResponse.json({ message: "If this email is registered, a new verification link has been sent." }, { status: 200 });
    }

    if (user.emailIsVerified) {
      return NextResponse.json({ message: "This email address is already verified." }, { status: 200 }); // Or 400 if preferred
    }

    // Generate a new verification token and update the user
    const newVerificationToken = uuidv4();
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationToken: newVerificationToken,
        emailVerificationTokenExpiresAt: new Date(Date.now() + 3600 * 1000 * 24), // Optional: token expiry (e.g., 24 hours)
      },
    });

    // Send the new verification email
    const emailResult = await sendVerificationEmail(normalizedEmail, newVerificationToken);

    if (!emailResult.success) {
      console.error(`Failed to resend verification email to ${normalizedEmail}:`, emailResult.error);
      // Even if email sending fails, we don't want to give too much info.
      // The user might have other ways to verify or contact support.
      return NextResponse.json({ error: "Could not send verification email. Please try again later or contact support." }, { status: 500 });
    }

    return NextResponse.json({ message: "A new verification email has been sent. Please check your inbox." }, { status: 200 });

  } catch (error) {
    console.error("Error resending verification email:", error);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}
