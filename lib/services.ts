import { createClient } from "@deepgram/sdk";
import { uploadAudioToS3 } from "@/lib/audioUploadToS3";
import { v4 as uuidv4 } from "uuid";

const DEEPGRAM_API_KEY = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;

if (!DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY is not set in the environment variables");
}

const deepgram = createClient(DEEPGRAM_API_KEY);

export async function startInterviewWithIntro(interviewOutline: string) {
  if (!interviewOutline) {
    throw new Error("Interview outline (text) is missing.");
  }
  try {
    const response = await fetch(`/api/start-interview`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: interviewOutline,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to start the interview");
    }

    const result = await response.json();

    return result;
  } catch (error) {
    console.error("Error generating interview:", error);
    throw error;
  }
}

export async function generateAudio(text: string) {
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

  return { audioUrl, mimeType: result.headers.get("content-type") };
}