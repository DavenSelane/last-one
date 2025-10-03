// app/api/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma"; // your Prisma client
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const subjectId = searchParams.get("subjectId");
    const grades = searchParams.get("grades");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};
    if (type) where.type = type;
    if (subjectId) where.subjectId = parseInt(subjectId);
    if (grades) where.grades = parseInt(grades);

    // Filter content for students by their grade and enrolled subjects
    if (session?.user?.role === "STUDENT") {
      const student = await DB.user.findUnique({
        where: { id: parseInt(session.user.id!) },
        include: {
          subjectsEnrolled: { select: { id: true } },
          class: { select: { gradeId: true } },
        },
      });

      if (student) {
        const studentSubjectIds = student.subjectsEnrolled.map((s) => s.id);
        const studentGradeId = student.class?.gradeId;

        // Only show content matching student's subjects and grade
        where.AND = [
          studentSubjectIds.length > 0
            ? { subjectId: { in: studentSubjectIds } }
            : { subjectId: -1 }, // No match if no subjects enrolled
          studentGradeId
            ? { grades: studentGradeId }
            : { grades: -1 }, // No match if no grade
        ];
      }
    }

    const total = await DB.content.count({ where });
    const content = await DB.content.findMany({
      where,
      include: {
        subject: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      content,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate authorId if provided
    if (data.authorId) {
      const authorExists = await DB.user.findUnique({
        where: { id: data.authorId },
      });
      if (!authorExists) {
        return NextResponse.json({ error: "Invalid author ID. User does not exist." }, { status: 400 });
      }
    }

    const newContent = await DB.content.create({
      data: {
        title: data.title,
        type: data.type,
        subjectId: data.subjectId,
        grades: data.grades,
        description: data.description,
        body: data.body,
        videoUrl: data.videoUrl,
        documentUrl: data.documentUrl,
        imageUrl: data.imageUrl,
        tags: data.tags,
        allowComments: data.allowComments,
        featured: data.featured,
        authorId: data.authorId || null,
      },
    });

    return NextResponse.json(newContent);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
