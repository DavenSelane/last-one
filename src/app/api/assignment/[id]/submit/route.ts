import { NextRequest, NextResponse } from "next/server";
import { DB } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const isOpenAIConfigured = process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_actual_openai_api_key_here";

const openai = isOpenAIConfigured
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// POST - Submit assignment for AI grading
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "STUDENT") {
      return NextResponse.json({ error: "Only students can submit assignments" }, { status: 401 });
    }

    const data = await request.json();
    const assignmentId = parseInt(params.id);
    const studentId = parseInt(session.user.id!);

    // Check if assignment exists
    const assignment = await DB.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Assignment not found" },
        { status: 404 }
      );
    }

    // Check if assignment is past due
    if (new Date() > assignment.dueDate) {
      return NextResponse.json(
        { error: "Assignment is past due date" },
        { status: 400 }
      );
    }

    // Check if OpenAI is configured
    if (!isOpenAIConfigured || !openai) {
      return NextResponse.json(
        {
          error: "AI grading is not configured. Please contact administrator.",
        },
        { status: 503 }
      );
    }

    // If assignment has questions, use AI to grade
    let score = 0;
    let feedback = "";

    if (assignment.questions && data.answers) {
      const questions = JSON.parse(assignment.questions);
      const answers = data.answers;

      // Create prompt for AI grading
      const gradingPrompt = `You are an assignment grading assistant. Grade the following student submission.

Assignment Title: ${assignment.title}
Max Score: ${assignment.maxScore}

Questions and Student Answers:
${questions.map((q: any, i: number) => `
Q${i + 1}: ${q.question}
${q.correctAnswer ? `Expected Answer: ${q.correctAnswer}` : ''}
Student Answer: ${answers[i] || 'No answer provided'}
Points: ${q.points || 0}
`).join('\n')}

Please provide:
1. Total score out of ${assignment.maxScore}
2. Detailed feedback for each question
3. Overall assessment

Format your response as JSON:
{
  "score": <number>,
  "questionFeedback": [
    {
      "question": <number>,
      "points": <number>,
      "feedback": "<string>"
    }
  ],
  "overallFeedback": "<string>"
}`;

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: "You are a fair and thorough assignment grader. Provide constructive feedback and accurate scoring.",
            },
            {
              role: "user",
              content: gradingPrompt,
            },
          ],
          response_format: { type: "json_object" },
          temperature: 0.3,
        });

        const gradingResult = JSON.parse(completion.choices[0]?.message?.content || "{}");
        score = gradingResult.score || 0;
        feedback = JSON.stringify(gradingResult);

      } catch (error: any) {
        console.error("AI grading error:", error);
        return NextResponse.json(
          { error: "Failed to grade assignment with AI" },
          { status: 500 }
        );
      }
    } else {
      // If no questions, store answers for manual grading
      score = 0;
      feedback = "Pending manual review";
    }

    // Check if student already submitted
    const existingResult = await DB.result.findFirst({
      where: {
        assignmentId: assignmentId,
        studentId: studentId,
      },
    });

    if (existingResult) {
      // Update existing submission
      const updatedResult = await DB.result.update({
        where: { id: existingResult.id },
        data: {
          score: score,
          answers: JSON.stringify(data.answers),
          feedback: feedback,
          gradedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Assignment resubmitted and graded",
        result: updatedResult,
      });
    } else {
      // Create new submission
      const result = await DB.result.create({
        data: {
          assignmentId: assignmentId,
          studentId: studentId,
          score: score,
          answers: JSON.stringify(data.answers),
          feedback: feedback,
          gradedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Assignment submitted and graded",
        result: result,
      });
    }
  } catch (error) {
    console.error("Error submitting assignment:", error);
    return NextResponse.json(
      { error: "Failed to submit assignment" },
      { status: 500 }
    );
  }
}
