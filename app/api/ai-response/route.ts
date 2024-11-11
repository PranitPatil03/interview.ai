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

    const prompt = `You are an expert interviewer responsible for guiding a structured interview based strictly on the provided outline. Each response should analyze the candidate’s answer, then pose logical follow-up or next questions that align precisely with the interview's flow. Avoid introducing unrelated questions and prioritize clarity and relevance to the job role.

    Interview Outline and Context:
    ${parsedInterviewData}
    
    Candidate's Latest Response:
    ${transcription}
    
    Please follow these steps:
    
    1. **Evaluate the Candidate's Response**: Begin with a concise analysis of the completeness, relevance, and accuracy of the candidate's answer. Highlight specific strengths and identify any areas that would benefit from clarification.
    
    2. **Generate Relevant Follow-Up Questions**: Based on both the interview outline and the candidate’s answer, provide 2-3 follow-up questions that build on their response, keeping the interview flow natural and aligned with the outline. Ensure questions are purposeful, deepening understanding of the candidate’s technical or experiential fit for the role.
    
    3. **Provide Constructive Feedback**: Offer brief feedback that reinforces positives in the answer and gives constructive guidance where needed.
    
    4. **Determine the Next Logical Question**: Identify the most relevant question to proceed with, maintaining the structured order of the interview outline and adapting to the candidate’s progress in the interview.
    
    Respond in the following JSON structure:
    {
      "nextQuestion": "The primary follow-up or next logical question according to the outline",
      "feedback": "Brief feedback on the candidate’s response",
      "completionStatus": a number from 0-100 representing interview progress,
      "followUpQuestions": ["Array of 2-3 related follow-up questions"]
    }`;
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert interviewer focused on generating insightful follow-up questions and constructive feedback.",
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

    const response = JSON.parse(
      completion.choices[0]?.message?.content || "{}"
    );

    const questionResponse=await generateAudio(response.nextQuestion)
    console.log("ai-next-question",questionResponse)

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
