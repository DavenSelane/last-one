import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET user statistics
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(session.user.id!);
    const role = session.user.role;

    let stats: any = {};

    if (role === "STUDENT") {
      // Student statistics
      const results = await DB.result.findMany({
        where: { studentId: userId },
        include: {
          assignment: true,
        },
      });

      const totalAssignments = results.length;
      const completedAssignments = results.filter(r => r.score > 0).length;
      const averageScore = results.length > 0
        ? results.reduce((sum, r) => sum + r.score, 0) / results.length
        : 0;

      const pendingAssignments = await DB.assignment.findMany({
        where: {
          dueDate: {
            gte: new Date(),
          },
          results: {
            none: {
              studentId: userId,
            },
          },
        },
      });

      stats = {
        role: "student",
        totalAssignments,
        completedAssignments,
        pendingAssignments: pendingAssignments.length,
        averageScore: Math.round(averageScore * 10) / 10,
        recentResults: results.slice(0, 5).map(r => ({
          id: r.id,
          assignmentTitle: r.assignment?.title || "Unknown",
          score: r.score,
          submittedAt: r.submittedAt,
        })),
      };
    } else if (role === "TUTOR") {
      // Tutor statistics
      const lessons = await DB.lesson.findMany({
        where: { tutorId: userId },
        include: {
          assignments: {
            include: {
              results: true,
            },
          },
        },
      });

      const totalLessons = lessons.length;
      const totalAssignments = lessons.reduce((sum, lesson) => sum + lesson.assignments.length, 0);

      const allResults = lessons.flatMap(lesson =>
        lesson.assignments.flatMap(assignment => assignment.results)
      );

      const totalSubmissions = allResults.length;
      const averageScore = allResults.length > 0
        ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
        : 0;

      stats = {
        role: "tutor",
        totalLessons,
        totalAssignments,
        totalSubmissions,
        averageScore: Math.round(averageScore * 10) / 10,
        recentAssignments: lessons.flatMap(l => l.assignments)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map(a => ({
            id: a.id,
            title: a.title,
            dueDate: a.dueDate,
            submissions: a.results.length,
          })),
      };
    } else if (role === "ADMIN") {
      // Admin statistics
      const [
        totalUsers,
        totalAssignments,
        totalResults,
        totalLessons,
      ] = await Promise.all([
        DB.user.count(),
        DB.assignment.count(),
        DB.result.count(),
        DB.lesson.count(),
      ]);

      const allResults = await DB.result.findMany();
      const averageScore = allResults.length > 0
        ? allResults.reduce((sum, r) => sum + r.score, 0) / allResults.length
        : 0;

      // User counts by role
      const userRoleCounts = await DB.user.groupBy({
        by: ['role'],
        _count: { role: true },
      });

      const roleCounts = {
        ADMIN: 0,
        TUTOR: 0,
        PARENT: 0,
        STUDENT: 0,
      };

      userRoleCounts.forEach(item => {
        if (item.role) {
          roleCounts[item.role] = item._count.role;
        }
      });

      stats = {
        role: "admin",
        totalUsers,
        totalAssignments,
        totalSubmissions: totalResults,
        totalLessons,
        averageScore: Math.round(averageScore * 10) / 10,
        userRoleCounts: roleCounts,
      };
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
