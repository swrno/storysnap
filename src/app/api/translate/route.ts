import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { text, title, targetLanguage } = await request.json();

    if ((!text && !title) || !targetLanguage) {
      return NextResponse.json(
        { error: "Missing text/title or targetLanguage" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_API_KEY;
    
    if (!apiKey) {
      console.error("GOOGLE_API_KEY is missing in environment variables");
      return NextResponse.json(
        { error: "GOOGLE_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `You are a professional translator. Translate the following content to ${targetLanguage}.
    
    Input Data:
    ${JSON.stringify({ title, content: text, contentsLabel: "Contents" })}

    Instructions:
    1. Translate the "title" (if provided).
    2. Translate the "content" (if provided). Maintain original markdown formatting for content.
    3. Translate the "contentsLabel" (which is "Contents").
    4. Return ONLY a JSON object with keys "translatedTitle", "translatedContent", and "translatedContentsLabel".
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonResponse = JSON.parse(response.text());

    return NextResponse.json({ 
      translatedText: jsonResponse.translatedContent,
      translatedTitle: jsonResponse.translatedTitle,
      translatedContentsLabel: jsonResponse.translatedContentsLabel
    });
  } catch (error) {
    console.error("Translation error details:", error);
    return NextResponse.json(
      { error: "Failed to translate text", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
