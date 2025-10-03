import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await DB.subject.findMany({
      include: {
        tutors: true,
      },
    });
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
