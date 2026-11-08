import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { defaultSiteConfig, SiteConfig } from "@/lib/siteConfig";

export const runtime = "nodejs";

const sessionsDir = path.join(process.cwd(), "public", "sessions");

// ─── Netlify Blobs ─────────────────────────────────────────────────────────────
async function getBlobStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: "site-sessions", consistency: "strong" });
  } catch {
    return null;
  }
}

// In-memory fallback (localhost)
const memSessions = new Map<string, { config: SiteConfig; createdAt: number }>();

function generateSessionId(): string {
  // 6-8 char alphanumeric ID
  return Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 4);
}

// POST /api/session — Save a config and get back a short session ID
export async function POST(req: Request) {
  try {
    const body: SiteConfig = await req.json();
    const sessionId = generateSessionId();
    const payload = JSON.stringify({ config: body, createdAt: Date.now() });

    // 1. Try Netlify Blobs
    try {
      const store = await getBlobStore();
      if (store) {
        await store.set(`session:${sessionId}`, payload);
      }
    } catch (e) {
      console.warn("Netlify Blobs session save error:", e);
    }

    // 2. Local disk backup (if writable)
    try {
      if (!fs.existsSync(sessionsDir)) {
        fs.mkdirSync(sessionsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(sessionsDir, `${sessionId}.json`), payload, "utf-8");
    } catch (_) {}

    // 3. In-memory cache
    memSessions.set(sessionId, { config: body, createdAt: Date.now() });

    return NextResponse.json({ sessionId, success: true }, { status: 200 });
  } catch (err) {
    console.error("Session POST error:", err);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

// GET /api/session?s=SESSION_ID — Retrieve config for a share link
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("s");

    if (!sessionId || sessionId.length < 3) {
      return NextResponse.json(defaultSiteConfig, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    // 1. Check in-memory
    if (memSessions.has(sessionId)) {
      return NextResponse.json(memSessions.get(sessionId)!.config, {
        headers: { "Cache-Control": "no-store, max-age=0" },
      });
    }

    // 2. Try Netlify Blobs
    try {
      const store = await getBlobStore();
      if (store) {
        const raw = await store.get(`session:${sessionId}`, { type: "text" });
        if (raw) {
          const { config } = JSON.parse(raw as string);
          memSessions.set(sessionId, { config, createdAt: Date.now() });
          return NextResponse.json(config, {
            headers: { "Cache-Control": "no-store, max-age=0" },
          });
        }
      }
    } catch (blobErr) {
      console.warn("Netlify Blobs session get error:", blobErr);
    }

    // 3. Check disk
    try {
      const filePath = path.join(sessionsDir, `${sessionId}.json`);
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf-8");
        const { config } = JSON.parse(fileData);
        memSessions.set(sessionId, { config, createdAt: Date.now() });
        return NextResponse.json(config, {
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      }
    } catch (_) {}

    // Session not found — fallback to default template safely
    return NextResponse.json(defaultSiteConfig, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    console.error("Session GET error:", err);
    return NextResponse.json(defaultSiteConfig, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }
}
