export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

// 1. Keep your working PDF fix
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Parse PDF
    const pdfData = await pdfParse(buffer);
    const rawText = pdfData.text;

    // 3. Use specific model version to avoid 404s
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are a specialized Resume Parser. 
      Analyze the text below and extract the information into the exact JSON format provided.
      
      RULES:
      1. Return ONLY valid JSON.
      2. Do NOT use markdown code blocks (no \`\`\`json).
      3. If a field is missing, use an empty string "" or empty array [].
      
      JSON SCHEMA:
      {
        "name": "string",
        "title": "string",
        "summary": "string",
        "contact": {
          "phone": "string",
          "address": "string",
          "email": "string",
          "linkedin": "string",
          "github": "string"
        },
        "experiences": ["string (Role at Company | Date | Details)"],
        "education": ["string"],
        "skills": ["string"],
        "additional": {
          "certifications": ["string"],
          "awards": ["string"],
          "otherSkills": ["string"]
        }
      }

      RESUME TEXT:
      ${rawText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 4. Robust Cleaning (Handle potential markdown wrapping)
    let cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Safety check: sometimes models add "Here is the JSON:" text
    const firstBracket = cleanJson.indexOf("{");
    const lastBracket = cleanJson.lastIndexOf("}");
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
    }

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ data: parsedData });
  } catch (error: unknown) {
    console.error("Resume parsing failed:", error);

    // Return the actual error message for debugging
    return NextResponse.json(
      { error: (error as Error).message || "Failed to parse resume" },
      { status: 500 }
    );
  }
}
