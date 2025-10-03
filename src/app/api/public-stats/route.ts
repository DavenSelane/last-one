import { NextResponse } from "next/server";
import { DB } from "@/lib/prisma";

// GET public statistics (no authentication required)
export async function GET() {
  try {
    // Fetch counts from database in parallel
    const [studentsCount, tutorsCount, subjectsCount] = await Promise.all([
      DB.user.count({
        where: { role: "STUDENT" },
      }),
      DB.user.count({
        where: { role: "TUTOR" },
      }),
      DB.subject.count(),
    ]);

    return NextResponse.json({
      students: studentsCount,
      tutors: tutorsCount,
      subjects: subjectsCount,
    });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
