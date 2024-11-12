import { NextRequest, NextResponse } from "next/server";
import { generateAudio } from "@/lib/services";

const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY is not set in the environment variables");
}

interface RequestBody {
  text: string;
  options?: {
    model?: string;
    voice?: string;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    let { text } = body;

    const paragraphs = text.split("\n\n");
    text = paragraphs.slice(0, 2).join("\n\n");

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const { audioUrl, mimeType } = await generateAudio(text);

    return NextResponse.json({
      success: true,
      audioUrl,
      mimeType,
    });
  } catch (error) {
    console.error("Error generating text-to-speech:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate text-to-speech",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
