// app/api/localidades/estados/[uf]/route.ts (Temporary simplified version for testing)
import { NextRequest, NextResponse } from 'next/server';

// Define params type for context, matching Next.js App Router for dynamic segments
interface RouteContext {
  params: {
    uf: string; // This should match the folder name `[uf]`
  }
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { params } = context;
  const uf = params.uf?.toUpperCase(); // Extract uf from path

  // Log to server console (Vercel Functions log) to see if it's even hit
  console.log(`API_HIT: /api/localidades/estados/${uf}/municipios - Received UF: ${uf}`);

  if (!uf || uf.length !== 2) {
    console.log(`API_VALIDATION_FAIL: Invalid UF received: ${uf}`);
    return NextResponse.json({ error: 'Valid State UF (2 letters) is required.' }, { status: 400 });
  }

  // Return a simple success response
  return NextResponse.json({
    message: `Successfully reached API for UF: ${uf}.`,
    receivedUF: uf,
  });
}
