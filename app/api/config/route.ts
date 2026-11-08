import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { defaultSiteConfig, SiteConfig } from "@/lib/siteConfig";

const configPath = path.join(process.cwd(), "public", "site-config.json");

// ─── Netlify Blobs (persistent cross-request storage on Netlify) ──────────────
async function getBlobStore() {
  try {
    const { getStore } = await import("@netlify/blobs");
    return getStore({ name: "site-config", consistency: "strong" });
  } catch {
    return null;
  }
}

// In-memory cache
let memCache: SiteConfig | null = null;

export const runtime = "nodejs";

async function loadFullConfig(): Promise<SiteConfig> {
  if (memCache) return memCache;

  // Try Netlify Blobs
  try {
    const store = await getBlobStore();
    if (store) {
      const raw = await store.get("config", { type: "text" });
      if (raw) {
        memCache = JSON.parse(raw as string) as SiteConfig;
        return memCache;
      }
    }
  } catch (err) {
    console.warn("Netlify Blobs GET error:", err);
  }

  // Try disk
  try {
    if (fs.existsSync(configPath)) {
      const fileData = fs.readFileSync(configPath, "utf-8");
      const cfg = JSON.parse(fileData) as SiteConfig;
      if (cfg && cfg.person) {
        memCache = cfg;
        return memCache;
      }
    }
  } catch (_) {}

  return defaultSiteConfig;
}

export async function GET(req: Request) {
  const full = await loadFullConfig();

  // Security: check if caller wants full config with authorization header, or mask PIN by default
  const auth = req.headers.get("x-admin-auth");
  const isAuthorized = auth && auth === (full.admin?.pin || "1111");

  const safeConfig = {
    ...full,
    admin: {
      pin: isAuthorized ? full.admin?.pin || "1111" : "••••",
    },
  };

  return NextResponse.json(safeConfig, {
    headers: { "Cache-Control": "no-store, max-age=0" },
  });
}

export async function POST(req: Request) {
  try {
    const body: SiteConfig = await req.json();

    // Preserve existing PIN if incoming is masked "••••"
    const current = await loadFullConfig();
    if (body.admin?.pin === "••••" || !body.admin?.pin) {
      body.admin = { pin: current.admin?.pin || "1111" };
    }

    // Update in-memory cache immediately
    memCache = body;

    // Persist to disk if writable (localhost)
    try {
      fs.writeFileSync(configPath, JSON.stringify(body, null, 2), "utf-8");
    } catch (_) {}

    // Persist to Netlify Blobs (survives across all users & devices on Netlify)
    try {
      const store = await getBlobStore();
      if (store) {
        await store.set("config", JSON.stringify(body));
      }
    } catch (blobErr) {
      console.warn("Netlify Blobs POST error:", blobErr);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Config POST error:", error);
    return NextResponse.json({ success: true, note: "fallback" });
  }
}
