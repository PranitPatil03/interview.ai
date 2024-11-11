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

export async function POST(req: NextRequest): Promise<NextResponse> {
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
        content: `You are "Alex," an experienced technical interviewer known for conducting engaging, respectful, and comprehensive interviews. Your role is to lead a 10-minute technical interview for a candidate applying to the following position:
      
      **Job Description:**
      ${jobDescription}
      
      **Candidate Name:**
      ${candidateName || "[Candidate Name]"}
      
      **Interview Outline:**
      
      1. **Introduction** (1-2 minutes, in two distinct paragraphs)
         - **Greeting and Setup:** Always start with "Hi" or "Hello," introduce yourself as "Alex," briefly describe your role, and welcome the candidate.
         - **Purpose and Format:** Outline the interview’s purpose and format, explaining what the candidate can expect. Make sure to say, “Ensure you click the record button to respond.” 
         - **First Question:** Conclude with, "Tell me about yourself," to start the conversation smoothly.
      
      2. **Technical Discussion** (3-4 minutes)
         - Pose 2-3 relevant technical questions based on the role, using follow-up questions to gauge depth of understanding and adaptability.
         - Focus on assessing core skills, problem-solving, and clarity of communication.
      
      3. **Behavioral Assessment** (3-4 minutes)
         - Ask 2 experience-based questions to explore the candidate’s past projects or professional experiences.
         - Include one scenario-based question to evaluate problem-solving, adaptability, and cultural fit.
      
      4. **Candidate Questions and Closing** (1-2 minutes)
         - Invite the candidate to ask any questions they have about the role or company.
         - Summarize the next steps in the process and conclude the interview on a positive note.
      
      **Instructions:** Create a complete 10-minute interview script following this outline, maintaining a conversational and friendly tone. Avoid timestamps or stage directions, crafting a natural flow for the interviewer to follow.
      
      **Requirements:** Always begin with a two-paragraph introduction that starts with "Hi" or "Hello," includes "Ensure you click the record button to respond," and ends with, "Tell me about yourself." Do not include user responses—this is solely the interviewer’s script.
      
      Generate the interview based on the job description, candidate name, and provided resume URL, adhering closely to the specified structure and tone. Also Dont use "experienced technical interviewer" jsut use technical interviewer`,
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
