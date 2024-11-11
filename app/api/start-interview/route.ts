import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";

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

const deepgram = createClient(DEEPGRAM_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RequestBody;
    console.log("given bodi", body, "dfsdfsdfwerwerwer");
    let { text, options } = body;

    const paragraphs = text.split("\n\n");
    text = paragraphs.slice(0, 2).join("\n\n");
    console.log("interview textdsd", text);

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const { result } = await deepgram.speak.request(
      { text },
      {
        model: options?.model || "aura-asteria-en",
        voice: options?.voice || "aurora",
      }
    );

    if (!result) {
      throw new Error("Failed to generate audio");
    }

    const audioBuffer = await result.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      audio: base64Audio,
      mimeType: result.headers.get("content-type"),
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
