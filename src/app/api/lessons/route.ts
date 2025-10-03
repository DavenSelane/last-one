import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");

    let lessons;
    if (tutorId) {
      lessons = await DB.lesson.findMany({
        where: { tutorId: parseInt(tutorId) },
        include: {
          subject: true,
          class: {
            include: {
              grade: true,
            },
          },
        },
      });
    } else {
      lessons = await DB.lesson.findMany({
        include: {
          subject: true,
          class: {
            include: {
              grade: true,
            },
          },
        },
      });
    }

    return NextResponse.json(lessons);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
