import { NextResponse } from "next/server";
import { defaultSiteConfig, SiteConfig } from "@/lib/siteConfig";

// ─── Netlify Blobs (persistent cross-request storage on Netlify) ──────────────
// This is the ONLY reliable way to persist config on a serverless platform.
// Falls back gracefully on localhost.
async function getBlobStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: "site-config", consistency: "strong" });
  } catch {
    return null;
  }
}

// In-memory cache for the same serverless instance (reduces blob reads)
let memCache: SiteConfig | null = null;

export const runtime = "nodejs";

export async function GET() {
  // 1. Try in-memory cache first (fastest)
  if (memCache) {
    return NextResponse.json(memCache, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  }

  // 2. Try Netlify Blobs (persistent across all requests & devices)
  try {
    const store = await getBlobStore();
    if (store) {
      const raw = await store.get("config", { type: "text" });
      if (raw) {
        const cfg = JSON.parse(raw as string) as SiteConfig;
        memCache = cfg;
        return NextResponse.json(cfg, {
          headers: { "Cache-Control": "no-store, max-age=0" },
        });
      }
    }
  } catch (err) {
    console.warn("Netlify Blobs GET error (using defaults):", err);
  }

  // 3. Return defaults if nothing saved yet
  return NextResponse.json(defaultSiteConfig, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(req: Request) {
  try {
    const body: SiteConfig = await req.json();

    // Update in-memory cache immediately
    memCache = body;

    // Persist to Netlify Blobs (survives across all users & devices)
    try {
      const store = await getBlobStore();
      if (store) {
        await store.set("config", JSON.stringify(body));
      }
    } catch (blobErr) {
      console.warn("Netlify Blobs POST error:", blobErr);
      // Not fatal — client localStorage still has it
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Config POST error:", error);
    return NextResponse.json({ success: true, note: "fallback" });
  }
}
