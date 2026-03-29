import { google } from "googleapis";
import fs from "fs";
import path from "path";

const TOKENS_PATH = path.join(process.cwd(), ".google-tokens.json");

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI,
  );
}

export function loadTokens(): {
  access_token: string;
  refresh_token: string;
} | null {
  try {
    if (fs.existsSync(TOKENS_PATH)) {
      const data = JSON.parse(fs.readFileSync(TOKENS_PATH, "utf-8"));
      return data;
    }
  } catch {
    // Token file missing or malformed
  }
  return null;
}

export function saveTokens(tokens: Record<string, unknown>) {
  fs.writeFileSync(TOKENS_PATH, JSON.stringify(tokens, null, 2));
}

export function getAuthenticatedClient() {
  const oauth2Client = getOAuth2Client();
  const tokens = loadTokens();
  if (!tokens) return null;
  oauth2Client.setCredentials(tokens);

  // Auto-save refreshed tokens
  oauth2Client.on("tokens", (newTokens) => {
    const existing = loadTokens();
    saveTokens({ ...existing, ...newTokens });
  });

  return oauth2Client;
}
