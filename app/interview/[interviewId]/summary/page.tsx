"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useState, useEffect } from "react";
import Link from "next/link";

const getInterviewData = async () => {
  // Simulated API call
  return {
    title: "Web Development Interview",
    date: "Completed on May 15, 2023",
    overallScore: 85,
    duration: "58 minutes",
    skillScores: [
      { skill: "JavaScript", score: 90 },
      { skill: "React", score: 85 },
      { skill: "Node.js", score: 80 },
      { skill: "CSS", score: 75 },
      { skill: "System Design", score: 70 },
    ],
    strengths: [
      "Strong understanding of JavaScript fundamentals",
      "Proficient in React component lifecycle",
      "Good grasp of Node.js async operations",
    ],
    areasForImprovement: [
      "Deepen knowledge of CSS animations",
      "Improve understanding of system design principles",
      "Practice more complex state management scenarios in React",
    ],
  };
};
export default function InterviewSummary({
  params,
}: {
  params: { interviewId: string };
}) {
  const [interviewData, setInterviewData] = useState<{
    title: string;
    date: string;
    overallScore: number;
    duration: string;
    skillScores: { skill: string; score: number }[];
    strengths: string[];
    areasForImprovement: string[];
  } | null>(null);

  console.log(params.interviewId)

  useEffect(() => {
    const fetchData = async () => {
      const data = await getInterviewData();
      setInterviewData(data);
    };
    fetchData();
  }, []);

  if (!interviewData) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">Interview Summary</h1>
          <p className="text-xl text-slate-400">
            Here&apos;s how you performed in your {interviewData.title}
          </p>
        </header>

        <Card className="bg-slate-900/50 border-slate-800 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex justify-between items-center">
              <span>Performance Overview</span>
              <Badge className="text-lg px-3 py-1 bg-indigo-500/20 text-indigo-300">
                {interviewData.overallScore}% Overall Score
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Date</p>
                <p className="text-lg font-semibold text-white">
                  {interviewData.date}
                </p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-sm text-slate-400">Duration</p>
                <p className="text-lg font-semibold text-white">
                  {interviewData.duration}
                </p>
              </div>
            </div>

            <div className="w-full">
              <h3 className="text-lg font-semibold text-white mb-4">
                Skill Breakdown
              </h3>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-[300px] flex items-center justify-center w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={interviewData.skillScores}>
                    <PolarGrid stroke="#4b5563" />
                    <PolarAngleAxis dataKey="skill" stroke="#9ca3af" />
                    <PolarRadiusAxis
                      angle={30}
                      domain={[0, 100]}
                      stroke="#4b5563"
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--color-score)"
                      fill="var(--color-score)"
                      fillOpacity={0.6}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </RadarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Key Strengths
              </h3>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {interviewData.strengths.map(
                  (strength: string, index: number) => (
                    <li key={index}>{strength}</li>
                  )
                )}
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">
                Areas for Improvement
              </h3>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {interviewData.areasForImprovement.map(
                  (area: string, index: number) => (
                    <li key={index}>{area}</li>
                  )
                )}
              </ul>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="border-slate-700 bg-slate-100">
              Download Full Report
            </Button>
            <Link href="/dashboard">
              <Button className="bg-indigo-500 hover:bg-indigo-600 text-white">
                Back to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
