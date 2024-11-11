import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import {
  fetchInterviewFromS3,
  uploadInterviewToS3,
} from "@/lib/uploadFileToS3";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

interface RequestBody {
  jobDescription: string;
  resumeUrl?: string;
  candidateName?: string;
  interviewId: string;
}

interface Message {
  role: "system" | "user";
  content: string;
}

export const startInterviewWithIntro = async (interviewOutline: string) => {
  if (!interviewOutline) {
    throw new Error("Interview outline (text) is missing.");
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/start-interview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: interviewOutline,
        }),
      }
    );

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
};

async function generateInterview(messages: Message[]) {
  try {
    const groq = new Groq({ apiKey: GROQ_API_KEY });

    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: messages,
      temperature: 0.8,
      max_tokens: 2000,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error calling Groq:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!GROQ_API_KEY) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as RequestBody;
    const { jobDescription, candidateName, interviewId } = body;

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required" },
        { status: 400 }
      );
    }

    const messages: Message[] = [
      {
        role: "system",
        content: `You are an experienced technical interviewer named "Alex," well-versed in the hiring process. Your objective is to conduct a thorough, 10-minute technical interview for a candidate applying for the following position:

Job Description:
${jobDescription}

Candidate Name:
${candidateName || "[Candidate Name]"}

The interview should always start with a two-paragraph introduction that sets the tone and provides a welcoming overview of the interview process. 

1. Introduction (Always 2 separate paragraphs, 1-2 minutes)
   - In the first paragraph, greet the candidate warmly and state your name and role.
   - In the second paragraph, briefly outline the purpose of the interview, explaining the format and what the candidate can expect.

2. Technical Discussion (3-4 minutes)
   - Pose 2-3 role-specific technical questions.
   - Evaluate the candidate's depth of knowledge with follow-up questions.
   - Adjust the technical depth based on the candidate's responses.

3. Behavioral Assessment (3-4 minutes)
   - Ask 2 questions regarding the candidate's past experiences.
   - Assess the candidate's problem-solving skills and cultural fit.
   - Present a scenario-based question to evaluate their critical thinking.

4. Candidate Questions and Closing (1-2 minutes)
   - Invite the candidate to ask any questions they may have.
   - Summarize the next steps in the interview process.
   - Conclude the interview on a positive and professional note.

Throughout the interview, maintain a warm, conversational tone while upholding high standards for technical assessment. Use appropriate pauses, transitions, and verbal cues to ensure the candidate feels comfortable. The final script should flow naturally as a dialogue without timestamps or stage directions.

Please generate a complete 10-minute technical interview script based on the provided job description, resume URL, and candidate name, beginning with the specified two-paragraph introduction.

*Note: Do not include user responses; this is solely for the interviewer.*
`,
      },
    ];

    const generatedInterview = await generateInterview(messages);

    if (!generatedInterview) {
      throw new Error("Failed to generate interview content");
    }

    const interviewUrl = await uploadInterviewToS3(
      generatedInterview,
      interviewId
    );

    if (!interviewUrl) {
      throw new Error("Failed to upload interview to S3");
    }

    const interviewContent = await fetchInterviewFromS3(interviewUrl);

    return NextResponse.json({
      success: true,
      interview: generatedInterview,
      interviewUrl: interviewUrl,
      interviewOutline: interviewContent,
    });
  } catch (error) {
    console.error("Error generating or uploading interview:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate or upload interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
