import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET single assignment
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const assignment = await DB.assignment.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        Lesson: {
          include: {
            subject: true,
            class: {
              include: {
                grade: true,
              },
            },
            tutor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        results: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(assignment);
  } catch (error) {
    console.error("Error fetching assignment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignment" },
      { status: 500 }
    );
  }
}

// PUT update assignment
export async function PUT(
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

    const updatedAssignment = await DB.assignment.update({
      where: { id: assignmentId },
      data: {
        title: data.title,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        pdfUrl: data.pdfUrl ?? undefined,
        solutionUrl: data.solutionUrl ?? undefined,
        imgUrl: data.imgUrl ?? undefined,
        lessonId: data.lessonId ? parseInt(data.lessonId) : undefined,
      },
    });

    return NextResponse.json(updatedAssignment);
  } catch (error) {
    console.error("Error updating assignment:", error);
    return NextResponse.json(
      { error: "Failed to update assignment" },
      { status: 500 }
    );
  }
}

// DELETE assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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

    await DB.assignment.delete({
      where: { id: assignmentId },
    });

    return NextResponse.json({ success: true, message: "Assignment deleted" });
  } catch (error) {
    console.error("Error deleting assignment:", error);
    return NextResponse.json(
      { error: "Failed to delete assignment" },
      { status: 500 }
    );
  }
}
