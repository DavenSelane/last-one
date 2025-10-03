import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = parseInt(params.id);

    // Fetch content from database
    const content = await DB.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 });
    }

    const fileUrl = content.documentUrl || content.videoUrl || content.imageUrl;

    if (!fileUrl) {
      return NextResponse.json({ error: "No file URL found" }, { status: 404 });
    }

    // Check if it's a local file or external URL
    if (fileUrl.startsWith('/uploads/')) {
      // Local file - serve directly
      const filePath = path.join(process.cwd(), 'public', fileUrl);

      try {
        const fileBuffer = await readFile(filePath);

        // Determine content type
        let contentType = "application/pdf";
        if (fileUrl.endsWith(".pdf")) {
          contentType = "application/pdf";
        } else if (fileUrl.endsWith(".mp4")) {
          contentType = "video/mp4";
        } else if (fileUrl.endsWith(".jpg") || fileUrl.endsWith(".jpeg")) {
          contentType = "image/jpeg";
        } else if (fileUrl.endsWith(".png")) {
          contentType = "image/png";
        } else if (fileUrl.endsWith(".doc") || fileUrl.endsWith(".docx")) {
          contentType = "application/msword";
        }

        // Create filename
        const ext = path.extname(fileUrl);
        const filename = `${content.title.replace(/[^a-z0-9]/gi, "_")}${ext}`;

        // Return the file
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": contentType,
            "Content-Disposition": `inline; filename="${filename}"`,
            "Cache-Control": "public, max-age=31536000",
          },
        });
      } catch (fileError) {
        console.error("File read error:", fileError);
        return NextResponse.json(
          { error: "File not found on server" },
          { status: 404 }
        );
      }
    } else {
      // External URL (Cloudinary) - proxy it
      const response = await fetch(fileUrl);

      if (!response.ok) {
        return NextResponse.json(
          { error: "Failed to fetch file from external storage" },
          { status: response.status }
        );
      }

      const blob = await response.blob();

      // Determine content type
      let contentType = "application/pdf";
      if (fileUrl.endsWith(".pdf")) {
        contentType = "application/pdf";
      } else if (fileUrl.endsWith(".mp4")) {
        contentType = "video/mp4";
      } else if (fileUrl.endsWith(".jpg") || fileUrl.endsWith(".jpeg")) {
        contentType = "image/jpeg";
      } else if (fileUrl.endsWith(".png")) {
        contentType = "image/png";
      }

      const filename = `${content.title.replace(/[^a-z0-9]/gi, "_")}.pdf`;

      return new NextResponse(blob, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${filename}"`,
          "Cache-Control": "public, max-age=31536000",
        },
      });
    }
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
