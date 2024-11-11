"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Phone,
  MessageSquare,
  Users,
  Clock,
  Send,
  User,
  Bot,
  Pause,
  Play,
  Loader2,
} from "lucide-react";
import AudioVisualization from "./AudioVisualization";
import { AudioRecorder } from "@/lib/audioRecorder";

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
}

export default function InterviewMeet({
  params,
}: {
  params: { interviewId: string };
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "AI Interviewer",
      content:
        "Hello! Welcome to your interview. Let's begin with a brief introduction about yourself.",
      timestamp: new Date(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioRecorder, setAudioRecorder] = useState<AudioRecorder | null>(
    null
  );
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(10);
  const [timerStarted, setTimerStarted] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const recorder = new AudioRecorder({
      bucketName: process.env.NEXT_PUBLIC_S3_BUCKET_NAME!,
      region: process.env.NEXT_PUBLIC_AWS_REGION!,
      credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
      },
    });
    setAudioRecorder(recorder);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const startInterview = localStorage.getItem(
          `interview-intro-${params.interviewId}`
        );
        console.log("data data data", startInterview);
        if (startInterview) {
          const parsedData = JSON.parse(startInterview);
          if (parsedData.success && parsedData.audioUrl) {
            setAudioUrl(parsedData.audioUrl);
          }
        }
        setIsLoading(false);
        setTimerStarted(true);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.interviewId]);

  useEffect(() => {
    if (timerStarted && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);

      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && audioRef.current && audioUrl) {
      audioRef.current.play();
    }
  }, [timerStarted, timeLeft, audioUrl]);

  useEffect(() => {
    if (!isLoading && timeLeft === 0) {
      const timer = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);

      return () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
        clearInterval(timer);
      };
    }
  }, [stream, isLoading, timeLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAISpeaking((prev) => !prev);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeAudioAnalysis = (mediaStream: MediaStream) => {
    try {
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source =
        audioContextRef.current.createMediaStreamSource(mediaStream);

      analyserRef.current.fftSize = 256;
      analyserRef.current.smoothingTimeConstant = 0.5;
      source.connect(analyserRef.current);

      const detectSound = () => {
        if (!analyserRef.current || isMuted) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        const average =
          dataArray.reduce((acc, value) => acc + value, 0) / dataArray.length;

        setIsSpeaking(average > 20);

        requestAnimationFrame(detectSound);
      };

      detectSound();
    } catch (error) {
      console.error("Error initializing audio analysis:", error);
    }
  };

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      initializeAudioAnalysis(mediaStream);

      mediaStream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    } catch (error) {
      console.error("Error accessing media devices:", error);
    }
  };

  useEffect(() => {
    startStream();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const toggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsMuted((prev) => !prev);

      if (isMuted) {
        startRecording();
      } else {
        stopRecordingAndUpload();
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff((prev) => !prev);
    }
  };

  const endCall = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    router.push(`/interview/${params.interviewId}/summary`);
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim()) {
      setMessages([
        ...messages,
        {
          id: messages.length + 1,
          sender: "You",
          content: newMessage,
          timestamp: new Date(),
        },
      ]);
      setNewMessage("");
    }
  };

  const startRecording = async () => {
    if (!stream || !audioRecorder) return;

    try {
      await audioRecorder.startRecording(stream);
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
    }
  };

  const stopRecordingAndUpload = async () => {
    if (!audioRecorder) return;
    try {
      setIsRecording(false);
      const audioUrl = await audioRecorder.stopRecordingAndUpload();
      console.log("Recording uploaded:", audioUrl);
      const transcription = await fetchTranscription(audioUrl);
      console.log("Transcription:", transcription);
    } catch (error) {
      console.error("Failed to stop recording:", error);
    }
  };

  const fetchTranscription = async (audioUrl: string) => {
    try {
      const response = await fetch("/api/user-response", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ audioUrl }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch transcription");
      }

      const data = await response.json();
      return data.transcription;
    } catch (error) {
      console.error("Error fetching transcription:", error);
      return null;
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecordingAndUpload();
    } else {
      startRecording();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
      <div className="h-screen flex">
        <div className="flex-1 flex flex-col p-4">
          <div className="flex-1 grid grid-cols-2 gap-4 mb-4">
            <div className="relative rounded-xl overflow-hidden shadow-xl border border-slate-800 bg-slate-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-200 text-sm border border-slate-700">
                <span>You</span>
                <AudioVisualization
                  isActive={!isMuted}
                  isSpeaking={isSpeaking}
                />
              </div>
            </div>

            <div className="relative bg-slate-900/50 backdrop-blur-sm rounded-xl overflow-hidden shadow-xl border border-slate-800 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
                  <Bot className="w-10 h-10 text-indigo-500" />
                </div>
                <h3 className="text-2xl font-semibold text-white">
                  AI Interviewer
                </h3>
                <p className="text-slate-400 mt-2">
                  Technical Interview Session
                </p>
              </div>
              <div className="absolute bottom-4 left-4 flex items-center gap-3 bg-slate-900/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-slate-200 text-sm border border-slate-700">
                <span>AI Interviewer</span>
                <AudioVisualization
                  isActive={false}
                  isSpeaking={isAISpeaking}
                />
              </div>
            </div>
          </div>

          <Card className="p-4 bg-slate-900/50 border-slate-800 backdrop-blur-sm shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-slate-400" />
                <span className="text-slate-200 font-medium">
                  {formatTime(elapsedTime)}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-12 w-12 border-slate-700 ${
                    isMuted
                      ? "bg-red-500/20 border-red-500 hover:bg-red-500/30"
                      : "bg-slate-800 hover:bg-slate-800"
                  }`}
                  onClick={toggleMute}
                >
                  {isMuted ? (
                    <MicOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Mic className="w-5 h-5 text-slate-200" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-12 w-12 border-slate-700 ${
                    isVideoOff
                      ? "bg-red-500/20 border-red-500 hover:bg-red-500/30"
                      : "bg-slate-800 hover:bg-slate-800"
                  }`}
                  onClick={toggleVideo}
                >
                  {isVideoOff ? (
                    <VideoOff className="w-5 h-5 text-red-500" />
                  ) : (
                    <Video className="w-5 h-5 text-slate-200" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-12 w-12 border-slate-700 ${
                    isRecording
                      ? "bg-red-500/20 border-red-500 hover:bg-red-500/30"
                      : "bg-slate-800 hover:bg-slate-800"
                  }`}
                  onClick={toggleRecording}
                >
                  {isRecording ? (
                    <Pause className="w-5 h-5 text-red-500" />
                  ) : (
                    <Play className="w-5 h-5 text-slate-200" />
                  )}
                </Button>

                <Button
                  variant="destructive"
                  size="icon"
                  className="rounded-full h-12 w-12 bg-red-500 hover:bg-red-600"
                  onClick={endCall}
                >
                  <Phone className="w-5 h-5 rotate-[135deg]" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-12 w-12 border-slate-700 ${
                    activeTab === "chat"
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-500 hover:bg-slate-800 hover:text-slate-50"
                      : " bg-slate-800 hover:bg-slate-800"
                  }`}
                  onClick={() =>
                    setActiveTab(activeTab === "chat" ? "main" : "chat")
                  }
                >
                  <MessageSquare className="w-5 h-5 text-slate-100" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  className={`rounded-full h-12 w-12 border-slate-700 ${
                    activeTab === "participants"
                      ? "bg-indigo-500/20 border-indigo-500 text-indigo-500 hover:bg-slate-800"
                      : "bg-slate-800 hover:bg-slate-800"
                  }`}
                  onClick={() =>
                    setActiveTab(
                      activeTab === "participants" ? "main" : "participants"
                    )
                  }
                >
                  <Users className="w-5 h-5 text-slate-100" />
                </Button>
              </div>

              <div className="w-[100px]" />
            </div>
          </Card>
        </div>

        {activeTab !== "main" && (
          <div className="w-[400px] bg-slate-900/50 backdrop-blur-sm border-l border-slate-800">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="justify-start p-2 bg-transparent border-b border-slate-800">
                <TabsTrigger
                  value="chat"
                  className="gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-500"
                >
                  <MessageSquare className="w-4 h-4" /> Chat
                </TabsTrigger>
                <TabsTrigger
                  value="participants"
                  className="gap-2 data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-500"
                >
                  <Users className="w-4 h-4" /> Participants
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="flex-1 flex flex-col p-4">
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex gap-3 ${
                          message.sender === "You" ? "justify-end" : ""
                        }`}
                      >
                        {message.sender !== "You" && (
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <Bot className="w-5 h-5 text-indigo-500" />
                          </div>
                        )}
                        <div
                          className={`rounded-lg p-3 max-w-[80%] ${
                            message.sender === "You"
                              ? "bg-indigo-500/20 border border-indigo-500/50 text-slate-200"
                              : "bg-slate-800 border border-slate-700 text-slate-200"
                          }`}
                        >
                          <p>{message.content}</p>
                          <span className="text-xs text-slate-400 mt-1 block">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                        {message.sender === "You" && (
                          <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-indigo-500" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <form onSubmit={sendMessage} className="mt-4 flex gap-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="bg-slate-800 border-slate-700 text-slate-200 placeholder:text-slate-400 focus-visible:ring-indigo-500/50"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full bg-indigo-500 hover:bg-indigo-600"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="participants" className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">You</p>
                      <p className="text-sm text-slate-400">Candidate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-200">
                        AI Interviewer
                      </p>
                      <p className="text-sm text-slate-400">
                        Technical Interviewer
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
      {(isLoading || timeLeft > 0) && (
        <div className="absolute top-20 left-0 right-0 z-50 flex justify-center">
          <div className="bg-slate-900/90 backdrop-blur-sm px-6 py-3 rounded-xl border border-slate-700 shadow-lg">
            {isLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                <p className="text-lg font-semibold text-white">
                  Preparing Interview...
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-semibold text-white">
                  Interview starts in
                </p>
                <div className="text-4xl font-bold text-indigo-500">
                  {timeLeft}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="auto" />}
    </div>
  );
}
