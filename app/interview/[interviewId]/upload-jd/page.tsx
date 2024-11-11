"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileText, Bot, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@clerk/nextjs/server";
import { useUser } from "@clerk/nextjs";
import { uploadFileToS3 } from "@/lib/uploadFileToS3";

interface InterviewData {
  jobDescription: string;
  resumeUrl: string;
  interviewId: string;
}

export default function InterviewSetup({
  params,
}: {
  params: { interviewId: string };
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [fileUrl, setFileUrl] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const user = useUser();

  if (!user) {
    router.push("/dashboard");
  }

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadedFileName(file.name);

    try {
      const uploadedFileUrl = await uploadFileToS3(file, params.interviewId);
      setFileUrl(uploadedFileUrl);
      setIsFileUploaded(true);
      toast.success("Resume uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const generateInterview = async (data: InterviewData) => {
    try {
      const response = await fetch("/api/create-interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription: data.jobDescription,
          resumeUrl: data.resumeUrl,
          interviewId: data.interviewId,
          candidateName: user.user?.fullName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate interview");
      }

      const result = await response.json();
      console.log("interview", result.interview);
      console.log("interviewUrl", result.interviewUrl);
      console.log("interviewOutline", result.interviewOutline);

      return result;
    } catch (error) {
      console.error("Error generating interview:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const interviewData: InterviewData = {
        jobDescription,
        resumeUrl: fileUrl,
        interviewId: params.interviewId,
      };

      const result = await generateInterview(interviewData);

      localStorage.setItem(
        `interview-${params.interviewId}`,
        JSON.stringify({
          ...interviewData,
          questions: result.interview,
        })
      );

      toast.success("Interview generated successfully!");
      router.push(`/interview/${params.interviewId}/system-check`);
    } catch (error) {
      console.error("Error in submission:", error);
      toast.error(
        "Failed to generate interview. Please check your inputs and try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const sampleJD = `Full-stack NextJS AI Engineer
$20k – $30k • No equity
About the job
Responsibilities:
- Develop and maintain fullstack applications using NodeJS, NextJS, ReactJS, ExpressJS, and MongoDB
- Experience and understanding of Vercel's AI SDK
- Integrate AI APIs into our applications, ensuring seamless functionality and user experience
- Collaborate with the development team to design, develop, and deploy new features
- Implement CRUD operations and ensure efficient data handling and storage
- Utilize Vercel's AI SDK, OpenAI SDK, and Langchain.js for AI integration
- Leverage CSS frameworks such as TailwindCSS, ShadcnUI to build great UI
- Write clean, maintainable, and efficient code
- Participate in code reviews and provide constructive feedback
- Stay updated with the latest industry trends and technologies
Requirements:
- Proficient in JavaScript and modern JavaScript frameworks and libraries (Node.js, Next.js, React.js)
- Experience with backend frameworks like Express.js and databases such as MongoDB
- Familiarity with AI concepts such as transformers and diffusion models
- Hands-on experience with Vercel AI SDK, OpenAI npm SDK, and Langchain.js
- Understanding of CRUD applications and their implementation
- Proficiency with CSS frameworks such as TailwindCSS, ShadcnUI
- Ability to work collaboratively in a team environment
- Strong problem-solving skills and attention to detail.
- Excellent communication skills
Preferred Qualifications:
- Previous experience or projects showcasing AI integration - strong plus.
- Familiarity with AI-driven applications and their development.
- Knowledge of AI technologies and frameworks
- Ability to learn quickly and adapt to new technologies`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">
                Interview Setup
              </CardTitle>
              <CardDescription className="text-slate-400">
                Provide the job description and your resume to personalize your
                interview experience
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-slate-200">
                  Job Description
                </Label>
                <Textarea
                  id="jobDescription"
                  placeholder="Enter the job role requirements and qualifications here..."
                  className="min-h-[200px] border-slate-700 focus:border-indigo-500/50 focus:ring-indigo-500/20 text-slate-100"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setJobDescription(sampleJD)}
                  className="mt-2 border-slate-100 hover:bg-slate-100"
                >
                  Load Sample JD
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-200">Resume Upload</Label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center hover:border-indigo-500/50 transition-colors">
                  <Input
                    type="file"
                    className="hidden"
                    id="resume-upload"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleFileUpload(file);
                      }
                    }}
                  />
                  <Label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                    ) : (
                      <Upload className="w-8 h-8 text-slate-400" />
                    )}
                    <span className="text-slate-400">
                      Click to upload your resume (PDF, DOC, DOCX, or TXT)
                    </span>
                  </Label>
                  {!isUploading && uploadedFileName && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-indigo-400">
                      <FileText className="w-4 h-4" />
                      <span>{uploadedFileName}</span>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200"
                disabled={!jobDescription || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Interview...
                  </>
                ) : (
                  <>
                    Continue to System Check <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}