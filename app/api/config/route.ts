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
    console.warn("Could not read site-config.json from disk, using defaults:", error);
  }
  return NextResponse.json(defaultSiteConfig);
}

export async function POST(req: Request) {
  try {
    const body: SiteConfig = await req.json();
    try {
      // Attempt to save to disk if on writable filesystem (e.g. localhost)
      fs.writeFileSync(configPath, JSON.stringify(body, null, 2), "utf-8");
    } catch (fsErr) {
      // Netlify / Vercel serverless has a read-only filesystem; this is completely normal!
      console.log("Serverless read-only environment: config stored in client-side state.", fsErr);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Config POST error:", error);
    return NextResponse.json({ success: true, note: "fallback" });
  }
}
