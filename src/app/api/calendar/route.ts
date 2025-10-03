import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all calendar events for the logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const events = await DB.calendarEvent.findMany({
      where: {
        userId: parseInt(session.user.id!),
      },
      orderBy: {
        start: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching calendar events:", error);
    return NextResponse.json(
      { error: "Failed to fetch calendar events" },
      { status: 500 }
    );
  }
}

// POST create new calendar event
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const event = await DB.calendarEvent.create({
      data: {
        title: data.title,
        description: data.description || null,
        start: new Date(data.start),
        end: new Date(data.end),
        userId: parseInt(session.user.id!),
        allDay: data.allDay || false,
        color: data.color || "#3b82f6",
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json(
      { error: "Failed to create calendar event" },
      { status: 500 }
    );
  }
}
