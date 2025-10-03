import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Check if OpenAI API key is configured
const isOpenAIConfigured = process.env.OPENAI_API_KEY &&
  process.env.OPENAI_API_KEY !== "your_actual_openai_api_key_here";

const openai = isOpenAIConfigured
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  : null;

// Educational fallback responses for common topics
const getFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();

  // Math topics
  if (lowerMessage.includes('math') || lowerMessage.includes('algebra') || lowerMessage.includes('equation')) {
    return "I'd love to help with math! For algebra problems, remember to:\n1. Isolate the variable on one side\n2. Perform the same operation on both sides\n3. Simplify step by step\n\nCould you share the specific problem you're working on?";
  }

  // Science topics
  if (lowerMessage.includes('science') || lowerMessage.includes('physics') || lowerMessage.includes('chemistry')) {
    return "Science is fascinating! I can help with concepts, formulas, and problem-solving. What specific topic are you studying? (e.g., photosynthesis, Newton's laws, chemical reactions)";
  }

  // Study tips
  if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('exam')) {
    return "Here are some effective study tips:\n1. Break study sessions into 25-minute focused blocks (Pomodoro)\n2. Use active recall by testing yourself\n3. Create mind maps to visualize connections\n4. Teach concepts to others to reinforce learning\n\nWhat subject are you preparing for?";
  }

  // Homework help
  if (lowerMessage.includes('homework') || lowerMessage.includes('assignment')) {
    return "I'm here to help! For homework assistance:\n1. Share the question or topic\n2. Tell me what you've tried so far\n3. Let me know which part you're stuck on\n\nThis helps me give you the best guidance!";
  }

  // Default response
  return "I'm your AI study assistant! I can help with:\n\n📚 Subject explanations (Math, Science, English, etc.)\n📝 Study strategies and tips\n💡 Problem-solving guidance\n📖 Exam preparation\n\nWhat would you like help with today?";
};

export async function POST(request: NextRequest) {
  let userMessage = "";

  try {
    const { message, useFallback } = await request.json();
    userMessage = message; // Store message for error handling

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Use fallback mode if requested or if OpenAI is not configured
    if (useFallback || !isOpenAIConfigured || !openai) {
      const fallbackResponse = getFallbackResponse(message);
      return NextResponse.json({
        response: fallbackResponse,
        isFallback: true,
        message: !isOpenAIConfigured ? "Using educational assistant mode. Add OpenAI API key for AI-powered responses." : undefined
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI tutor for students. Provide educational assistance, answer questions, and help with learning. Keep responses concise and engaging.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const aiResponse = completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";

    return NextResponse.json({ response: aiResponse, isFallback: false });
  } catch (error: any) {
    console.error("OpenAI API error:", error);

    // Use stored message for fallback responses
    const fallbackResponse = getFallbackResponse(userMessage || "help");

    // Provide helpful error messages
    if (error?.status === 401) {
      return NextResponse.json({
        response: fallbackResponse,
        isFallback: true,
        message: "OpenAI API key is invalid. Using educational assistant mode."
      });
    }

    if (error?.status === 429) {
      return NextResponse.json({
        response: fallbackResponse,
        isFallback: true,
        message: "API rate limit reached. Using educational assistant mode. Please try AI mode again in a few minutes."
      });
    }

    // Use fallback for any other error
    return NextResponse.json({
      response: fallbackResponse,
      isFallback: true,
      message: "Temporary AI issue. Using educational assistant mode."
    });
  }
}
