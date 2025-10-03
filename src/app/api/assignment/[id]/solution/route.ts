import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH - Upload solution for assignment
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const assignmentId = parseInt(params.id);

    // Check if assignment exists and belongs to the tutor
    const existingAssignment = await DB.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        Lesson: true,
      },
    });

    if (!existingAssignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (
      session.user.role === "TUTOR" &&
      existingAssignment.Lesson?.tutorId !== parseInt(session.user.id!)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Update solution URL
    const updatedAssignment = await DB.assignment.update({
      where: { id: assignmentId },
      data: {
        solutionUrl: data.solutionUrl,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Solution uploaded successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error uploading solution:", error);
    return NextResponse.json(
      { error: "Failed to upload solution" },
      { status: 500 }
    );
  }
}
