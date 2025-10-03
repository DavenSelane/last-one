import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET all assignments with optional tutor filter
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tutorId = searchParams.get("tutorId");

    const assignments = await DB.assignment.findMany({
      where: tutorId
        ? {
            Lesson: {
              tutorId: parseInt(tutorId),
            },
          }
        : undefined,
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
        // TEMPORARY: Uncomment after Prisma regeneration
        // subject: true,
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
      orderBy: {
        dueDate: "desc",
      },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error("Error fetching assignments:", error);
    return NextResponse.json(
      { error: "Failed to fetch assignments" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "TUTOR" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const newAssignment = await DB.assignment.create({
      data: {
        title: data.title,
        dueDate: new Date(data.dueDate),
        subjectId: data.subjectId ? parseInt(data.subjectId) : undefined,
        lessonId: data.lessonId ? parseInt(data.lessonId) : undefined,
        // TEMPORARY: Uncomment after Prisma regeneration
        // createdById: parseInt(session.user.id!),
        pdfUrl: data.pdfUrl ?? undefined,
        solutionUrl: data.solutionUrl ?? undefined,
        imgUrl: data.imgUrl ?? undefined,
      },
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
        // TEMPORARY: Uncomment after Prisma regeneration
        // subject: true,
        // createdBy: {
        //   select: {
        //     id: true,
        //     firstName: true,
        //     lastName: true,
        //   },
        // },
      },
    });

    return NextResponse.json(newAssignment);
  } catch (error: unknown) {
    console.error("Failed to create assignment:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
