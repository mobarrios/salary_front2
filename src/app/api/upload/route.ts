import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs"; // asegúrate de Node.js runtime
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // lee opcionalmente header y footer
    const files: Record<string, File | null> = {
      header: formData.get("header") as File | null,
      footer: formData.get("footer") as File | null,
    };

    const saved: Record<string, string | null> = { header: null, footer: null };
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    for (const [field, file] of Object.entries(files)) {
      if (!file) continue;
      const arrayBuffer = await file.arrayBuffer(); // SIN streams
      const buffer = Buffer.from(arrayBuffer);
      const safeName = file.name.replace(/[^\w.\-]+/g, "_");
      const filename = `${Date.now()}_${safeName}`;
      await fs.writeFile(path.join(uploadDir, filename), buffer);
      saved[field] = filename;
    }

    return NextResponse.json({ ok: true, ...saved }, { status: 200 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}