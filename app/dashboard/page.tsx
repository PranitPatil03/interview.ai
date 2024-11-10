"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Code,
  Database,
  Briefcase,
  ArrowRight,
  Clock,
  Users,
  User,
  Settings,
  LogOut,
} from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { SignOutButton, useUser } from "@clerk/nextjs";

// Define TypeScript interfaces for better type safety
interface InterviewType {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  color: string;
  duration: string;
  difficulty: string;
  participants: string;
}

interface RecentInterview {
  id: string;
  title: string;
  date: string;
  score?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  // Protect the dashboard route
  if (isLoaded && !user) {
    router.push("/");
    return null; // Return null while redirecting
  }

  const interviewTypes: InterviewType[] = [
    {
      id: "wd",
      title: "Web Development",
      icon: Code,
      description: "Frontend and backend skills assessment",
      color: "bg-indigo-500",
      duration: "60 min",
      difficulty: "Intermediate",
      participants: "1,234",
    },
    {
      id: "ds",
      title: "Data Science",
      icon: Database,
      description: "Analytics and machine learning expertise",
      color: "bg-indigo-500",
      duration: "75 min",
      difficulty: "Advanced",
      participants: "987",
    },
    {
      id: "pm",
      title: "Product Management",
      icon: Briefcase,
      description: "Strategy and execution for PMs",
      color: "bg-indigo-500",
      duration: "45 min",
      difficulty: "All Levels",
      participants: "2,345",
    },
  ];

  const recentInterviews: RecentInterview[] = [
    {
      id: "1",
      title: "Interview with John Doe",
      date: "2023-10-01",
      score: 85,
    },
    {
      id: "2",
      title: "Interview with Jane Smith",
      date: "2023-10-02",
      score: 92,
    },
  ];

  const startInterview = (type: string) => {
    const interviewId = `${type}-${uuidv4()}`;
    router.push(`/interview/${interviewId}/upload-jd`);
  };

  const handleViewReport = (interviewId: string) => {
    router.push(`/interview/${interviewId}/report`);
  };

  const startSkillAssessment = () => {
    router.push('/assessment');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <header className="flex justify-between items-center">
          <div className="flex flex-col items-start justify-center">
            <h1 className="text-4xl font-bold text-white">
              Choose Your Interview Experience
            </h1>
            <p className="text-xl text-slate-400">
              Select the interview type that aligns with your career goals and
              showcase your skills to potential employers.
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-full"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={user?.imageUrl}
                    alt={user?.fullName || "User"}
                  />
                  <AvatarFallback>
                    {user?.fullName?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.fullName}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <SignOutButton>
                  <div className="flex items-center">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </div>
                </SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {interviewTypes.map((type) => (
            <motion.div
              key={type.id}
              whileHover={{ scale: 1.03 }}
              onHoverStart={() => setHoveredCard(type.id)}
              onHoverEnd={() => setHoveredCard(null)}
              className="relative cursor-pointer"
            >
              <Card className="h-full bg-slate-900/50 border-slate-800 overflow-hidden backdrop-blur-sm relative">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <Avatar
                      className={`h-12 w-12 ${type.color}/10 flex items-center justify-center border-[0.5px]`}
                    >
                      <type.icon className="text-center text-indigo-500" />
                    </Avatar>
                    <Badge
                      variant="secondary"
                      className="bg-slate-800 text-slate-200"
                    >
                      {type.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl text-white mt-4">
                    {type.title}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {type.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-4">
                  <div className="flex justify-between text-sm text-slate-400">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {type.duration}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {type.participants} participants
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="relative z-10">
                  <Button
                    className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white relative z-10"
                    onClick={() => startInterview(type.id)}
                    aria-label={`Start ${type.title} Interview`}
                  >
                    Start Interview
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
                {hoveredCard === type.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        <section className="bg-slate-900/30 rounded-xl p-8 backdrop-blur-sm">
          <h2 className="text-2xl font-semibold text-white mb-6">
            Your Recent Interviews
          </h2>
          <div className="space-y-4">
            {recentInterviews.map((interview) => (
              <div
                key={interview.id}
                className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage
                      src={user?.imageUrl}
                      alt={user?.fullName || ""}
                    />
                    <AvatarFallback>
                      {user?.fullName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium text-white">
                      {interview.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      Completed on{" "}
                      {new Date(interview.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant="secondary"
                    className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20"
                  >
                    {interview.score}% Score
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-slate-200"
                    onClick={() => handleViewReport(interview.id)}
                  >
                    View Report
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h2 className="text-2xl font-semibold text-white mb-4">
            Not sure where to start?
          </h2>
          <p className="text-slate-400 mb-6">
            Take our quick assessment to find the perfect interview for your
            skills.
          </p>
          <Button
            variant="outline"
            className="border-slate-700 bg-slate-100"
            onClick={startSkillAssessment}
          >
            Start Skill Assessment
          </Button>
        </section>
      </div>
    </div>
  );
}