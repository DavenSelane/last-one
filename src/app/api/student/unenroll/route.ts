import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { subjectId } = await req.json();

    if (!subjectId) {
      return NextResponse.json({ error: "Subject ID is required" }, { status: 400 });
    }

    const studentId = parseInt(session.user.id!);

    // Unenroll student from subject
    await DB.user.update({
      where: { id: studentId },
      data: {
        subjectsEnrolled: {
          disconnect: { id: parseInt(subjectId) },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully unenrolled from subject"
    });
  } catch (error) {
    console.error("Unenrollment error:", error);
    return NextResponse.json(
      { error: "Failed to unenroll from subject" },
      { status: 500 }
    );
  }
}
