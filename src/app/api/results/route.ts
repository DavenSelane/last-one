import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST - Submit assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { assignmentId, submissionUrl, answers } = body;

    if (!assignmentId) {
      return NextResponse.json(
        { error: "Assignment ID is required" },
        { status: 400 }
      );
    }

    // Check if student already submitted this assignment
    const existingSubmission = await DB.result.findFirst({
      where: {
        assignmentId: parseInt(assignmentId),
        studentId: parseInt(session.user.id),
      },
    });

    let result;
    if (existingSubmission) {
      // Update existing submission
      result = await DB.result.update({
        where: { id: existingSubmission.id },
        data: {
          submissionUrl: submissionUrl || existingSubmission.submissionUrl,
          answers: answers || existingSubmission.answers,
          submittedAt: new Date(),
          status: "submitted",
        },
        include: {
          assignment: {
            include: {
              Lesson: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      });
    } else {
      // Create new submission
      result = await DB.result.create({
        data: {
          assignmentId: parseInt(assignmentId),
          studentId: parseInt(session.user.id),
          submissionUrl,
          answers,
          score: 0,
          status: "submitted",
        },
        include: {
          assignment: {
            include: {
              Lesson: {
                include: {
                  subject: true,
                },
              },
            },
          },
        },
      });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get student's submissions
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const assignmentId = searchParams.get("assignmentId");

    const where: any = {
      studentId: parseInt(session.user.id),
    };

    if (assignmentId) {
      where.assignmentId = parseInt(assignmentId);
    }

    const results = await DB.result.findMany({
      where,
      include: {
        assignment: {
          include: {
            Lesson: {
              include: {
                subject: true,
              },
            },
          },
        },
      },
      orderBy: {
        submittedAt: "desc",
      },
    });

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
