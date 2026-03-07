import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  // Simple middleware that just passes through for now
  // Authentication is handled at the API route level
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
