import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = parseInt(params.id);

    // Users can only access their own data unless they're admin
    if (session.user.role !== "ADMIN" && parseInt(session.user.id!) !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const user = await DB.user.findUnique({
      where: { id: userId },
      include: {
        subjectsEnrolled: {
          select: {
            id: true,
            name: true,
          },
        },
        class: {
          include: {
            grade: true,
          },
        },
        grade: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Don't send password to client
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}
