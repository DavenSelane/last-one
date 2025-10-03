import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET single announcement
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const announcement = await DB.announcement.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

// PUT update announcement
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const announcementId = parseInt(params.id);

    // Check if announcement exists
    const existingAnnouncement = await DB.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check authorization (only author or admin can update)
    if (
      session.user.role !== "ADMIN" &&
      existingAnnouncement.authorId !== parseInt(session.user.id!)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedAnnouncement = await DB.announcement.update({
      where: { id: announcementId },
      data: {
        title: data.title,
        description: data.description,
        date: data.date ? new Date(data.date) : undefined,
        classId: data.classId ? parseInt(data.classId) : null,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(updatedAnnouncement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

// DELETE announcement
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const announcementId = parseInt(params.id);

    // Check if announcement exists
    const existingAnnouncement = await DB.announcement.findUnique({
      where: { id: announcementId },
    });

    if (!existingAnnouncement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    // Check authorization (only author or admin can delete)
    if (
      session.user.role !== "ADMIN" &&
      existingAnnouncement.authorId !== parseInt(session.user.id!)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await DB.announcement.delete({
      where: { id: announcementId },
    });

    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}
