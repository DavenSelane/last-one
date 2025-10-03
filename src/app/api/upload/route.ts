import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // "document", "video", or "image"

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);

    // Determine folder based on type
    let folder = "documents";
    if (type === "video" || file.type.startsWith("video/")) {
      folder = "videos";
    } else if (type === "image" || file.type.startsWith("image/")) {
      folder = "images";
    }

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const fileName = `${timestamp}_${originalName}`;

    // Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL
    const fileUrl = `/uploads/${folder}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename: fileName,
      type: file.type,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}

// Configure to handle large files
export const maxDuration = 30; // 30 seconds timeout for file uploads
