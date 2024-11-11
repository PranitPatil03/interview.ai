import { NextRequest, NextResponse } from "next/server";
const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
const DEEPGRAM_URL = "https://api.deepgram.com/v1/listen";

interface RequestBody {
  audioUrl: string;
}

interface DeepgramResponse {
  results: {
    channels: Array<{
      alternatives: Array<{
        transcript: string;
      }>;
    }>;
  };
}

async function generateTranscription(audioUrl: string) {
  try {
    const response = await fetch(DEEPGRAM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${DEEPGRAM_API_KEY}`,
      },
      body: JSON.stringify({
        url: audioUrl,
        model: "nova-2",
        smart_format: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to transcribe audio");
    }

    const data: DeepgramResponse = await response.json();
    return data.results.channels[0].alternatives[0].transcript;
  } catch (error) {
    console.error("Error calling Deepgram:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!DEEPGRAM_API_KEY) {
      return NextResponse.json(
        { error: "Deepgram API key not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { audioUrl } = body;

    if (!audioUrl) {
      return NextResponse.json(
        { error: "Audio URL is required" },
        { status: 400 }
      );
    }

    const transcription = await generateTranscription(audioUrl);

    return NextResponse.json({
      success: true,
      transcription: transcription,
      audioUrl: audioUrl,
    });
  } catch (error) {
    console.error("Error generating transcription:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to transcribe audio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
