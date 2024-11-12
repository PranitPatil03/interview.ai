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
      temperature: 0.5,
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

    // const messages: Message[] = [
    //   {
    //     role: "system",
    //     content: `You are "Alex," a technical interviewer responsible for conducting a structured 10-minute technical interview for a candidate applying for the following role:

    //     Job Description:
    //     ${jobDescription}

    //     Candidate Name:
    //     ${candidateName || "[Candidate Name]"}

    //     Interview Outline:

    //         **Introduction Requirements**:
    // - **Paragraph 1 (Setup)**:
    //   - Start with "Hi" or "Hello," introduce yourself as "Alex," mention your role, and briefly explain the interview purpose.
    //   - Include "Ensure you click the record button to respond."

    // - **Paragraph 2 (Format)**:
    //   - Outline what the candidate can expect during the interview, and end with "Tell me about yourself."

    // **Key Rules**:
    // - Only generate the introduction (two paragraphs) for now.
    // - Keep the tone professional and approachable.
    // - Avoid adding extra headings, bullet points, or stage directions.
    // - Focus on making the candidate feel comfortable.

    // **Example Format**:
    // Hi [Name], I'm Alex, a technical interviewer at [Company]. Welcome to your interview for the [Position] role. [Purpose statement]. Ensure you click the record button to respond.
    // We'll discuss your technical background, experience, and problem-solving approach. I'm looking forward to learning more about your skills. To get started, tell me about yourself.

    // **Very Important - Complete Interview script/outline instructions**

    //     1. **Introduction (1-2 minutes, in two distinct paragraphs)**
    //        - Start with "Hi" or "Hello," introducing yourself as "Alex," briefly explaining your role as a technical interviewer, and welcoming the candidate.
    //        - Clearly outline the interview’s purpose, stating what the candidate can expect, and include the phrase, “Ensure you click the record button to respond.”
    //        - End this section with "Tell me about yourself" to naturally start the conversation.
    //        - Structure this introduction in two concise paragraphs with no headings or additional formatting.

    //     2. **Technical Discussion (3-4 minutes)**
    //        - Ask 2-3 technical questions relevant to the role, using follow-up questions to assess depth of knowledge, adaptability, and problem-solving skills.
    //        - Focus on evaluating the candidate’s core competencies, communication clarity, and approach to technical challenges.

    //     3. **Behavioral Assessment (3-4 minutes)**
    //        - Ask 2 questions regarding the candidate’s experience, professional background, or past projects.
    //        - Include a scenario-based question to assess problem-solving, adaptability, and cultural fit.

    //     4. **Candidate Questions and Closing (1-2 minutes)**
    //        - Invite the candidate to ask any questions about the role or the company.
    //        - Summarize the next steps and end the interview on a positive note.

    //     **Instructions**: Develop a full 10-minute interview script following this outline. Use a friendly, conversational tone, avoid stage directions or timestamps, and maintain a natural flow for the interviewer to follow.

    //     **Requirements**:
    //     - Begin with the two-paragraph introduction that starts with "Hi" or "Hello," includes "Ensure you click the record button to respond," and ends with "Tell me about yourself."
    //     - Exclude any candidate responses—this script is solely for the interviewer.
    //     - Follow the specified structure, tone, and focus areas precisely.

    // **NOTE**: "This script only includes the introduction; please complete the full interview script according to the job description and instructions provided."

    //     `,
    //   },
    // ];

    const messages: Message[] = [
      {
        role: "system",
        content: `You are Alex, a technical interviewer. Generate a complete interview script following this exact structure:
    
    Job Description:
    ${jobDescription}
    
    Candidate Name:
    ${candidateName || "[Candidate Name]"}
    
    STRICT FORMAT REQUIREMENTS:
    
    1. INTRODUCTION (Must be exactly 2 paragraphs):
    
       Paragraph 1 (MANDATORY ELEMENTS):
       - Must start with "Hi" or "Hello"
       - Must introduce yourself: "I'm Alex, a technical interviewer"
       - Must explain the interview purpose
       - Must include exactly: "Ensure you click the record button to respond"
    
       Paragraph 2 (MANDATORY ELEMENTS):
       - Must explain the interview process and what to expect
       - Must end with exactly: "Tell me about yourself"
    
    2. TECHNICAL QUESTIONS:
       Based on job description, generate:
       - 3 technical questions with follow-ups
       - Each question must assess specific skills from job description
       - Order questions from basic to complex
    
    3. BEHAVIORAL QUESTIONS:
       Generate exactly:
       - 1 project experience question
       - 1 technical challenge question
       - 1 team collaboration scenario
    
    4. CANDIDATE QUESTIONS SECTION:
       Must include these exact transitions:
       - "Now, I'd like to switch gears and give you an opportunity to ask questions."
       - "What questions do you have about the role, team, or company?"
       - Must include 2-3 example follow-up prompts like:
         * "Is there anything specific about our tech stack you'd like to know more about?"
         * "Would you like to know more about our development process?"
         * "Do you have any questions about the team structure or culture?"
    
    5. CLOSING:
       Must include:
       - Thank the candidate
       - Explain next steps clearly
       - End positively with encouragement
    
    EXAMPLE FORMAT:
    
    Hi [Name], I'm Alex, a technical interviewer at [Company]. Today, we'll be discussing your application for the [Position] role. I'm excited to learn more about your experience and technical skills. Ensure you click the record button to respond.
    
    During our conversation, we'll cover your background, technical expertise, and discuss some specific scenarios. I want to make this interview as comfortable and informative as possible. To get us started, tell me about yourself.
    
    [Technical Questions]
    
    [Behavioral Questions]
    
    [Candidate Questions Section]
    "Now, I'd like to switch gears and give you an opportunity to ask questions. What questions do you have about the role, team, or company?"
    
    [Closing]
    
    STRICT RULES:
    1. Always follow exact paragraph structure for introduction
    2. No timestamps or markers
    3. No candidate responses
    4. No bullet points or numbering
    5. Questions must directly relate to job description
    6. Maintain conversational tone throughout
    7. No additional headers or formatting
    8. No mentions of interview duration
    9. Must include dedicated questions section
    10. Must use exact transition phrases for questions section
    
    FORMAT CHECK:
    - First paragraph must have greeting and setup
    - Second paragraph must end with "Tell me about yourself"
    - Technical questions must match job requirements
    - Must include all behavioral scenarios
    - Must have proper questions section with transitions
    - Must have clear closing with next steps
    
    RESPONSE STRUCTURE:
    Always present as a continuous interview script with clear paragraph breaks, but no explicit sections or headers. Use transitional phrases to move between sections naturally.
    
    TRANSITIONS BETWEEN SECTIONS:
    - After introduction: Move naturally from "tell me about yourself" to first technical question
    - Before behavioral: "Now, let's discuss some of your past experiences..."
    - Before questions: "Now, I'd like to switch gears and give you an opportunity to ask questions..."
    - Before closing: "Thank you for those questions..." or "Those are great questions..."
    
    Remember: The script should flow naturally while maintaining a professional and welcoming tone throughout.`,
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
