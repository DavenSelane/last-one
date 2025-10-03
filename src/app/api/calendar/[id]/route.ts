import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET single calendar event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const event = await DB.calendarEvent.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (event.userId !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching calendar event:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar event" },
      { status: 500 }
    );
  }
}

// PUT update calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const eventId = parseInt(params.id);

    // Check if event exists
    const existingEvent = await DB.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (existingEvent.userId !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedEvent = await DB.calendarEvent.update({
      where: { id: eventId },
      data: {
        title: data.title,
        description: data.description || null,
        start: data.start ? new Date(data.start) : undefined,
        end: data.end ? new Date(data.end) : undefined,
        allDay: data.allDay,
        color: data.color,
      },
    });

    return NextResponse.json(updatedEvent);
  } catch (error) {
    console.error("Error updating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to update calendar event" },
      { status: 500 }
    );
  }
}

// DELETE calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const eventId = parseInt(params.id);

    // Check if event exists
    const existingEvent = await DB.calendarEvent.findUnique({
      where: { id: eventId },
    });

    if (!existingEvent) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (existingEvent.userId !== parseInt(session.user.id!)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await DB.calendarEvent.delete({
      where: { id: eventId },
    });

    return NextResponse.json({ success: true, message: "Event deleted" });
  } catch (error) {
    console.error("Error deleting calendar event:", error);
    return NextResponse.json(
      { error: "Failed to delete calendar event" },
      { status: 500 }
    );
  }
}
