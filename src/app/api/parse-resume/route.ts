export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import {
  extractUploadText,
  UnsupportedResumeFileError,
} from "@/lib/resume/extractUploadText";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const rawText = await extractUploadText(buffer, file.name || "resume.pdf");

    if (!rawText) {
      return NextResponse.json(
        { error: "Could not read any text from that file." },
        { status: 422 },
      );
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const prompt = `
      You are a specialized Resume Parser. 
      Analyze the text below and extract the information into the exact JSON format provided.
      
      RULES:
      1. Return ONLY valid JSON.
      2. Do NOT use markdown code blocks.
      3. If a field is missing, use an empty string "" or empty array [].
      4. Intelligently separate roles, companies, dates, and descriptions into the provided object fields.
      5. Remove any citation markers from the content.

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
          "github": "string",
          "website": "string"
        },
        "experiences": [ 
          { 
            "title": "Job Title or Role", 
            "subtitle": "Company Name", 
            "date": "Date Range", 
            "description": "Job Details" 
          } 
        ],
        "education": [ 
          { 
            "title": "Degree", 
            "subtitle": "Institution", 
            "date": "Graduation Year or Range" 
          } 
        ],
        "projects": [ 
          { 
            "title": "Project Name", 
            "subtitle": "Tech Stack or Role", 
            "date": "Date Range or Link", 
            "description": "Project Description" 
          } 
        ], 
        "skills": ["string"],
        "languages": ["string"],
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

    let cleanJson = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const firstBracket = cleanJson.indexOf("{");
    const lastBracket = cleanJson.lastIndexOf("}");
    if (firstBracket !== -1 && lastBracket !== -1) {
      cleanJson = cleanJson.substring(firstBracket, lastBracket + 1);
    }

    const parsedData = JSON.parse(cleanJson);

    return NextResponse.json({ data: parsedData });
  } catch (error: unknown) {
    console.error("Resume parsing failed:", error);

    if (error instanceof UnsupportedResumeFileError) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }

    return NextResponse.json(
      { error: "Failed to parse resume. Please try another file." },
      { status: 500 },
    );
  }
}
