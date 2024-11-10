import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, Code2, LineChart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SignInButton } from "@clerk/nextjs";

const Home = () => {
  const features = [
    {
      title: "AI-Powered Interviews",
      description:
        "Advanced AI technology conducts realistic technical interviews tailored to your field.",
      icon: Bot,
    },
    {
      title: "Real-time Feedback",
      description:
        "Get instant feedback on your responses and detailed performance analysis.",
      icon: LineChart,
    },
    {
      title: "Technical Assessment",
      description:
        "Comprehensive evaluation of your technical skills and problem-solving abilities.",
      icon: Code2,
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          {/* Hero Icon */}
          <div className="flex justify-center">
            <div className="p-4 bg-blue-500/10 rounded-full">
              <Bot className="w-16 h-16 text-blue-500" />
            </div>
          </div>

          {/* Hero Content */}
          <div className="space-y-6">
            <h1 className="text-6xl font-bold text-white">
              AI-Powered Interview Assistant
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Experience seamless technical interviews with our AI interviewer.
              Get instant feedback and comprehensive analysis.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <SignInButton>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 text-lg h-auto transition-all duration-200">
                Get Started <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignInButton>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-16">
            {features.map((feature, index) => (
              <Card key={index} className="bg-slate-900/50 border-slate-800">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto">
                    <feature.icon className="w-6 h-6 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-slate-400">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Home;
