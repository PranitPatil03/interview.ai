import { NextRequest, NextResponse } from "next/server";
import { Groq } from "groq-sdk";
import { generateAudio } from "@/lib/services";

export interface InterviewResponse {
  nextQuestion: string;
  feedback?: string;
  completionStatus: number;
  followUpQuestions: string[];
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { transcription, parsedInterviewData } = await req.json();

    const prompt = `You are an expert interviewer conducting a structured interview strictly based on the provided outline. Each response should analyze the candidate’s answer and then pose logical follow-up or next questions aligned with the interview's flow. Avoid introducing unrelated questions and prioritize clarity and relevance to the job role. Maintain time control and stay within the allocated interview duration.

    **Interview Outline and Context:**
    ${parsedInterviewData}
    
    **Candidate's Latest Response:**
    ${transcription}
    
    Please follow these steps:
    
    1. **Evaluate the Candidate's Response:**
       - Begin with a concise analysis of the candidate’s answer, focusing on completeness, relevance, and accuracy. 
       - Identify strengths in their response and highlight areas where they might need further clarification.
    
    2. **Generate Relevant Follow-Up Questions:**
       - Based on the candidate’s answer and the interview outline, provide 2-3 follow-up questions that naturally build on the response. 
       - Ensure questions are purposeful, relevant, and deepen understanding of the candidate’s technical or experiential fit for the role.
       - Keep the flow natural and aligned with the interview's structure.
    
    3. **Provide Constructive Feedback:**
       - Offer brief, constructive feedback on the candidate’s response, reinforcing strengths and providing guidance where needed.
       - Ensure feedback is short, impactful, and encouraging.
    
    4. **Determine the Next Logical Question:**
       - Based on the interview’s progress and structure, identify the next logical question to proceed with.
       - Keep the interview structured and on track, adhering to the provided outline.
    
    5. **Time Control:**
       - Track the interview’s progress to ensure it’s well-paced. Aim to cover around 6-7 main questions within the allotted time.
       - Avoid the interview dragging on unnecessarily; ensure it flows smoothly while still covering all key areas.
    
    6. **Brief Acknowledgment:**
       - Start each response with a short acknowledgment or feedback on the candidate’s answer to keep the conversation conversational and engaging.
       - This helps the candidate feel understood and naturally guides the flow of the interview.
    
    7. **Next Question Guidelines:**
       - **Important:** The nextQuestion field must contain **only the question** and nothing else. Do not include any additional instructions, comments, or information.
       
       Respond in the following JSON structure:
       {
         "nextQuestion": "The primary follow-up or next logical question according to the outline",
         "feedback": "Brief feedback on the candidate’s response",
         "completionStatus": "A number from 0-100 representing interview progress",
       }`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert interviewer focused on generating insightful follow-up questions and constructive feedback. Your responses must be valid JSON objects.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.7,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    });

    let response: InterviewResponse;
    try {
      response = JSON.parse(
        completion.choices[0]?.message?.content || "{}"
      ) as InterviewResponse;
    } catch (error) {
      console.error("Error parsing JSON response:", error);
      throw new Error("Failed to parse AI response");
    }

    if (!response.nextQuestion) {
      throw new Error("Invalid AI response: missing nextQuestion");
    }

    const questionResponse = await generateAudio(response.nextQuestion);

    return NextResponse.json(questionResponse);
  } catch (error) {
    console.error("Error in Main Interview", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run interview",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
