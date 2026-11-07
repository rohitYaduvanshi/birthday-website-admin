import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { defaultSiteConfig, SiteConfig } from "@/lib/siteConfig";

const configPath = path.join(process.cwd(), "public", "site-config.json");

export async function GET() {
  try {
    if (fs.existsSync(configPath)) {
      const fileData = fs.readFileSync(configPath, "utf-8");
      const config = JSON.parse(fileData);
      return NextResponse.json(config, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }
  } catch (error) {
    console.error("Error reading site-config.json:", error);
  }
  return NextResponse.json(defaultSiteConfig);
}

export async function POST(req: Request) {
  try {
    const body: SiteConfig = await req.json();
    fs.writeFileSync(configPath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error writing site-config.json:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save configuration" },
      { status: 500 }
    );
  }
}

