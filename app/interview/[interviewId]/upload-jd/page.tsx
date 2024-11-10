"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, Bot, ArrowRight } from "lucide-react"

export default function InterviewSetup({ params }: { params: { interviewId: string }}) {
  const router = useRouter()
  const [jobDescription, setJobDescription] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/interview/${params.interviewId}/system-check`)
  }

  const sampleJD = `Senior Frontend Developer
Requirements:
- 5+ years of experience with React.js
- Strong knowledge of TypeScript
- Experience with state management (Redux, Context API)
- Understanding of modern web technologies and best practices
- Experience with responsive design and cross-browser compatibility
- Strong problem-solving skills and attention to detail`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl">
          <CardHeader className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-500" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Interview Setup</CardTitle>
              <CardDescription className="text-slate-400">
                Provide the job description and your resume to personalize your interview experience
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-slate-200">Job Description</Label>
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
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      setIsUploading(true)
                      setUploadedFileName(e.target.files?.[0]?.name || null)
                    }}
                  />
                  <Label
                    htmlFor="resume-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-slate-400" />
                    <span className="text-slate-400">
                      Click to upload your resume (PDF, DOC, DOCX)
                    </span>
                  </Label>
                  {isUploading && uploadedFileName && (
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
                disabled={!jobDescription || !isUploading}
              >
                Continue to System Check <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}