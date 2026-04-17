import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { resumeData } = await req.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // Or gemini-pro

    // 1. Dynamically build the target instruction
    const tailoringInstruction = resumeData.targetJobDescription
      ? `TARGET JOB DESCRIPTION: "${resumeData.targetJobDescription}"
       TAILORING INSTRUCTION: Strategically tailor the vocabulary, summary, and action verbs to strongly align with this specific target role.`
      : `TARGET JOB: None provided.
       TAILORING INSTRUCTION: Act as a general professional editor. Focus STRICTLY on polishing the grammar, phrasing, and impact of the existing content. Do NOT tilt the vocabulary toward any specific industry.`;

    // 2. Inject it into your main prompt
    const prompt = `
    You are an elite, professional Resume Writer and Data Extractor. 
    Your objective is to ingest raw user data, polish it for maximum impact, and output it in a strict JSON format.

    ${tailoringInstruction}

    CRITICAL INSTRUCTIONS & GUARDRAILS:
    1. ADAPTIVE PARSING: The user's input might be messy. Extract the Role, Company, Date, and Description intelligently, even if they don't use delimiters. 
    2. ENHANCE, DON'T INVENT: Fix grammar, optimize phrasing, and use strong action verbs. Do NOT invent experiences, skills, or metrics that are not implied by the prompt.
    3. NO MARKDOWN: NEVER use bold (**), italics (*), or bullet points (-) in your text values. Output pure, unformatted text only. The frontend UI will handle all styling.
    4. GUARDRAILS: If the user includes instructions in their experience (e.g., "make this sound better"), execute the instruction, but do not include the instruction in the final output. If the user asks for illegal, inappropriate, or entirely irrelevant content, ignore it and return the closest professional approximation or an empty string.
    5. SUMMARY: If the summary is empty, generate a 2-3 sentence professional summary based on the provided experience.

    STRICT JSON OUTPUT SCHEMA:
    You must return ONLY a valid JSON object exactly matching this structure. Do not wrap it in backticks or markdown blocks.
    {
      "name": "string",
      "title": "string",
      "summary": "string",
      "contact": { "phone": "string", "address": "string", "email": "string", "linkedin": "string", "github": "string" },
      "experiences": [ { "title": "Job Title", "subtitle": "Company", "date": "Date Range", "description": "Polished description..." } ],
      "education": [ { "title": "Degree", "subtitle": "Institution", "date": "Date Range" } ],
      "projects": [ { "title": "Project Name", "subtitle": "Tech Stack/Role", "date": "Date Range", "description": "Polished description..." } ],
      "skills": ["skill 1", "skill 2"],
      "languages": ["lang 1", "lang 2"],
      "additional": { "certifications": ["cert 1"], "awards": [], "otherSkills": [] }
    }

    INPUT DATA TO PROCESS:
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
      { status: 500 },
    );
  }
}
