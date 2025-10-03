import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";

export async function GET() {
  try {
    const grades = await DB.grade.findMany();
    return NextResponse.json(grades);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "An unexpected error occurred";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
