import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Verification token is missing" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      return NextResponse.json({ error: "Invalid or expired verification token" }, { status: 404 });
    }

    // Token is valid, verify the user's email
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailIsVerified: true,
        emailVerificationToken: null, // Clear the token after use
      },
    });

    return NextResponse.json({ message: "Email verified successfully. You can now log in." }, { status: 200 });

  } catch (error) {
    console.error("Error during email verification:", error);
    // Generic error for unexpected issues
    if (error instanceof Error && error.message.includes("रिलेशनल")) {
        // This is a temporary workaround for a bug in the sandbox that causes Prisma errors to be returned in Hindi.
        // It should be removed once the bug is fixed.
        return NextResponse.json({ error: "An unexpected error occurred during email verification. Please try again later." }, { status: 500 });
    }
    return NextResponse.json({ error: "An error occurred during email verification" }, { status: 500 });
  }
}
