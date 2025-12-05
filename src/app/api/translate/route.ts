import Groq from "groq-sdk";
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

    const apiKey = process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      console.error("GROQ_API_KEY is missing in environment variables");
      return NextResponse.json(
        { error: "GROQ_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const prompt = `You are a professional translator. Translate the following content to ${targetLanguage}.
    
    Input Data:
    ${JSON.stringify({ title, content: text, contentsLabel: "Contents" })}

    Instructions:
    1. Translate the "title" (if provided).
    2. Translate the "content" (if provided). Maintain original markdown formatting for content.
    3. Translate the "contentsLabel" (which is "Contents").
    4. Return ONLY a JSON object with keys "translatedTitle", "translatedContent", and "translatedContentsLabel".
    `;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that translates text and returns valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0]?.message?.content;

    if (!responseContent) {
      throw new Error("No content received from Groq API");
    }

    const jsonResponse = JSON.parse(responseContent);

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
