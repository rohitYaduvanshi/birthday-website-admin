import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { defaultSiteConfig, SiteConfig } from "@/lib/siteConfig";

export const runtime = "nodejs";

const configPath = path.join(process.cwd(), "public", "site-config.json");

async function getStoredConfig(): Promise<SiteConfig> {
  // 1. Try Netlify Blobs
  try {
    const { getStore } = await import("@netlify/blobs");
    const store = getStore({ name: "site-config", consistency: "strong" });
    const raw = await store.get("config", { type: "text" });
    if (raw) {
      return JSON.parse(raw as string);
    }
  } catch (_) {}

  // 2. Try disk
  try {
    if (fs.existsSync(configPath)) {
      const fileData = fs.readFileSync(configPath, "utf-8");
      const cfg = JSON.parse(fileData);
      if (cfg && cfg.person) return cfg;
    }
  } catch (_) {}

  return defaultSiteConfig;
}

export async function POST(req: Request) {
  try {
    const { pin } = await req.json();
    const currentConfig = await getStoredConfig();

    const storedPin = (currentConfig.admin?.pin || "1111").trim();
    const providedPin = (pin || "").trim();

    if (providedPin && providedPin === storedPin) {
      return NextResponse.json({
        success: true,
        config: currentConfig,
      });
    }

    return NextResponse.json(
      { success: false, error: "Incorrect PIN" },
      { status: 401 }
    );
  } catch (error) {
    console.error("Admin verify error:", error);
    return NextResponse.json(
      { success: false, error: "Server error during verification" },
      { status: 500 }
    );
  }
}

