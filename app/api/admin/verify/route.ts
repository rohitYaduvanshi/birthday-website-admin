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

    let storedPin = (currentConfig.admin?.pin || "1111").trim();
    if (!storedPin || storedPin === "••••") {
      storedPin = "1111";
    }

    const providedPin = (pin || "").trim();

    // STRICT: ONLY the current set PIN is valid!
    // (If default, it is 1111. Once changed to e.g. 5555, ONLY 5555 works, 1111 is rejected!)
    if (providedPin && providedPin === storedPin) {
      return NextResponse.json({
        success: true,
        config: {
          ...currentConfig,
          admin: { pin: storedPin },
        },
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
