import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";

export async function GET() {
  try {
    const assignments = await DB.assignment.findMany({
      include: {
        Lesson: {
          include: {
            subject: true,
            class: {
              include: {
                grade: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(assignments);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
