import { NextResponse } from "next/server";
import { getOAuth2Client } from "@/lib/googleAuth";

export async function GET() {
  const oauth2Client = getOAuth2Client();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["https://www.googleapis.com/auth/calendar.readonly"],
    prompt: "consent",
  });
  return NextResponse.redirect(url);
}
