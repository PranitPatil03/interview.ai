import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@deepgram/sdk";
import { uploadAudioToS3 } from "@/lib/audioUploadToS3";
import { v4 as uuidv4 } from "uuid";

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
    let { text } = body;

    const paragraphs = text.split("\n\n");
    text = paragraphs.slice(0, 2).join("\n\n");
    console.log("interview textdsd", text);

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const { result } = await deepgram.speak.request(
      { text },
      {
        model: "aura-asteria-en",
        voice: "aurora",
      }
    );

    if (!result) {
      throw new Error("Failed to generate audio");
    }

    const audioBuffer = await result.arrayBuffer();
    const audioFileName = `audio-${uuidv4()}.mp3`;

    const audioUrl = await uploadAudioToS3(
      audioBuffer,
      audioFileName,
      result.headers.get("content-type") || "audio/mpeg"
    );

    console.log(audioUrl)

    return NextResponse.json({
      success: true,
      audioUrl,
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
