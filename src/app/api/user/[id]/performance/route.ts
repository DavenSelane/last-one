import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get detailed results with assignment and subject information
    const results = await DB.result.findMany({
      where: { studentId: Number(params.id) },
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

    // Transform the data to flatten the structure
    const formattedResults = results.map((result) => ({
      id: result.id,
      score: result.score,
      submittedAt: result.submittedAt,
      assignment: {
        title: result.assignment?.title || "Unknown Assignment",
        maxScore: result.assignment?.maxScore || 100,
        lesson: {
          subject: {
            name: result.assignment?.Lesson?.subject?.name || "Unknown Subject",
          },
        },
      },
    }));

    return NextResponse.json(formattedResults);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
