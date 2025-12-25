import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Or gemini-pro

    const prompt = `
      You are an expert Resume Writer. I will give you raw resume data. 
      Your job is to POLISH and ENHANCE the content to make it professional, action-oriented, and impactful.
      
      TARGET JOB DESCRIPTION: "${
        resumeData.targetJobDescription || "General Software Engineering"
      }"

      INSTRUCTIONS:
      1. Fix grammar and spelling.
      2. Use strong action verbs (e.g., "Spearheaded," "Optimized," "Developed").
      3. If a "Summary" is empty, generate a strong one based on the experience and target job.
      4. Do NOT invent experiences. Only enhance what is provided.
      5. Return the result in the EXACT same JSON structure as the input.

      INPUT DATA:
      ${JSON.stringify(resumeData)}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean JSON
    const cleanJson = text.replace(/```json|```/g, "").trim();
    const polishedData = JSON.parse(cleanJson);

    return NextResponse.json({ data: polishedData });
  } catch (error) {
    console.error("Enhancement failed:", error);
    return NextResponse.json(
      { error: "Failed to enhance resume" },
      { status: 500 }
    );
  }
}
