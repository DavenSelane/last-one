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

    // Check if already enrolled
    const student = await DB.user.findUnique({
      where: { id: studentId },
      include: { subjectsEnrolled: true },
    });

    const alreadyEnrolled = student?.subjectsEnrolled.some(
      (subject) => subject.id === parseInt(subjectId)
    );

    if (alreadyEnrolled) {
      return NextResponse.json(
        { error: "Already enrolled in this subject" },
        { status: 400 }
      );
    }

    // Enroll student in subject
    await DB.user.update({
      where: { id: studentId },
      data: {
        subjectsEnrolled: {
          connect: { id: parseInt(subjectId) },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in subject"
    });
  } catch (error) {
    console.error("Enrollment error:", error);
    return NextResponse.json(
      { error: "Failed to enroll in subject" },
      { status: 500 }
    );
  }
}
