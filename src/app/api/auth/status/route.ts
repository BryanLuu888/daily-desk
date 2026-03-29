import { NextResponse } from "next/server";
import { loadTokens } from "@/lib/googleAuth";

export async function GET() {
  const tokens = loadTokens();
  return NextResponse.json({ connected: !!tokens });
}
