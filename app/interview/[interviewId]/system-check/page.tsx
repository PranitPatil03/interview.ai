"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Camera, Mic, CheckCircle, XCircle, Loader2, Bot } from "lucide-react";

export default function SystemCheck({
  params,
}: {
  params: { interviewId: string };
}) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [checkProgress, setCheckProgress] = useState(0);
  const [cameraStatus, setCameraStatus] = useState<
    "checking" | "success" | "error"
  >("checking");
  const [micStatus, setMicStatus] = useState<"checking" | "success" | "error">(
    "checking"
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    checkDevices();
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const setupAudioAnalyser = (mediaStream: MediaStream) => {
    audioContextRef.current = new AudioContext();
    analyserRef.current = audioContextRef.current.createAnalyser();
    const source = audioContextRef.current.createMediaStreamSource(mediaStream);
    source.connect(analyserRef.current);
    analyserRef.current.fftSize = 256;

    const updateAudioLevel = () => {
      if (!analyserRef.current) return;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(dataArray);
      const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
      setAudioLevel(average);
      animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
    };

    updateAudioLevel();
  };

  const checkDevices = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Simulate device checks
      setCheckProgress(33);
      setTimeout(() => {
        setCameraStatus("success");
        setCheckProgress(66);
      }, 1000);

      setTimeout(() => {
        setMicStatus("success");
        setCheckProgress(100);
      }, 2000);

      setupAudioAnalyser(mediaStream);
    } catch (error) {
      console.error("Error accessing media devices:", error);
      setCameraStatus("error");
      setMicStatus("error");
    }
  };

  const handleContinue = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    router.push(`/interview/${params.interviewId}/meet`);
  };

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
                System Check
              </CardTitle>
              <CardDescription className="text-slate-400">
                Let&apos;s make sure your camera and microphone are working
                properly
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-video bg-slate-950 rounded-lg overflow-hidden border border-slate-800">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
            </div>

            {/* <Progress 
              value={checkProgress} 
              className="w-full bg-slate-700"
            /> */}

            <div className="space-y-4">
              <DeviceStatus
                icon={Camera}
                label="Camera"
                status={cameraStatus}
              />
              <AudioStatus
                icon={Mic}
                label="Microphone"
                status={micStatus}
                audioLevel={audioLevel}
              />
            </div>

            <Button
              onClick={handleContinue}
              disabled={checkProgress !== 100}
              className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white transition-all duration-200"
            >
              {checkProgress === 100 ? (
                <>
                  Join Interview
                  <CheckCircle className="w-4 h-4" />
                </>
              ) : (
                <>
                  Checking devices
                  <Loader2 className="w-4 h-4 animate-spin" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

interface DeviceStatusProps {
  icon: React.ElementType;
  label: string;
  status: "checking" | "success" | "error";
}

function DeviceStatus({ icon: Icon, label, status }: DeviceStatusProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-slate-200">{label}</span>
      </div>
      {status === "checking" && (
        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
      )}
      {status === "success" && (
        <CheckCircle className="w-5 h-5 text-green-500" />
      )}
      {status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
    </div>
  );
}

interface AudioStatusProps extends DeviceStatusProps {
  audioLevel: number;
}

function AudioStatus({ icon: Icon, label, status, audioLevel }: AudioStatusProps) {
  const bars = 20;
  const activeBarWidth = Math.floor((audioLevel / 100) * bars);

  return (
    <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-slate-200">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-0.5 h-5">
          {Array.from({ length: bars }).map((_, i) => (
            <div
              key={i}
              className={`w-0.5 mx-px rounded-full transition-all duration-100 ${
                i < activeBarWidth ? 'bg-indigo-500' : 'bg-slate-600'
              }`}
              style={{
                height: `${Math.min(100, (((i + 1) / bars) * 100) + 30)}%`
              }}
            />
          ))}
        </div>
        {status === "checking" && <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />}
        {status === "success" && <CheckCircle className="w-5 h-5 text-green-500" />}
        {status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
      </div>
    </div>
  );
}
