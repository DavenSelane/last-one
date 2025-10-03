import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    // Get session to verify user is a student
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json({ message: "Only students can submit assignments" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const assignmentId = formData.get("assignmentId") as string;

    if (!file) {
      return NextResponse.json({ message: "No file provided" }, { status: 400 });
    }

    if (!assignmentId) {
      return NextResponse.json({ message: "Assignment ID is required" }, { status: 400 });
    }

    // Verify assignment exists
    const assignment = await DB.assignment.findUnique({
      where: { id: parseInt(assignmentId) },
    });

    if (!assignment) {
      return NextResponse.json({ message: "Assignment not found" }, { status: 404 });
    }

    // Check if student already submitted this assignment
    const existingSubmission = await DB.result.findFirst({
      where: {
        assignmentId: parseInt(assignmentId),
        studentId: parseInt(session.user.id!),
      },
    });

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads", "submissions");
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      // Directory might already exist, ignore error
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split(".").pop();
    const fileName = `assignment_${assignmentId}_student_${session.user.id}_${timestamp}.${fileExtension}`;
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    await writeFile(filePath, buffer);

    // Create URL for the file
    const fileUrl = `/uploads/submissions/${fileName}`;

    // Create or update result in database
    if (existingSubmission) {
      // Update existing submission
      const updatedResult = await DB.result.update({
        where: { id: existingSubmission.id },
        data: {
          submissionUrl: fileUrl,
          submittedAt: new Date(),
          status: "submitted",
        },
      });

      return NextResponse.json({
        message: "Assignment resubmitted successfully",
        result: updatedResult,
      });
    } else {
      // Create new submission
      const newResult = await DB.result.create({
        data: {
          studentId: parseInt(session.user.id!),
          assignmentId: parseInt(assignmentId),
          submissionUrl: fileUrl,
          status: "submitted",
          score: 0,
        },
      });

      return NextResponse.json({
        message: "Assignment submitted successfully",
        result: newResult,
      });
    }
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { message: "Failed to submit assignment", error: (error as Error).message },
      { status: 500 }
    );
  }
}
