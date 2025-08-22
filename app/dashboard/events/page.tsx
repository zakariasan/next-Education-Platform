"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Code,
  Atom,
  Sparkles,
  Clock,
  Users,
  Lightbulb,
  ArrowLeft,
  Bell,
  Star,
  Zap,
} from "lucide-react";
import Link from "next/link";
const ComingSoonPage = () => {
  const title = "Event page Coming sooon";
  const description =
    "We're crafting something amazing Events for your physics education experience";
  const features = [
    "Real-time student progress tracking",
    "Interactive physics simulations",
    "Advanced reporting tools",
    "AI-powered insights",
  ];
  const estimatedTime = "Coming This Month";
  const backUrl = "/dashboard/teacher";
  const [progress, setProgress] = useState(0);
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  // Simulate progress animation
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 85 ? prev + 1 : 85));
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating physics symbols */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-10 text-6xl text-blue-200/30 animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          ∑
        </div>
        <div
          className="absolute top-40 right-20 text-5xl text-purple-200/30 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        >
          π
        </div>
        <div
          className="absolute bottom-32 left-20 text-4xl text-emerald-200/30 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "2s" }}
        >
          Δ
        </div>
        <div
          className="absolute top-60 left-1/2 text-3xl text-amber-200/30 animate-bounce"
          style={{ animationDuration: "2.8s", animationDelay: "0.5s" }}
        >
          λ
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="outline"
            asChild
            className="bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90"
          >
            <Link href={backUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Main content */}
        <div className="text-center space-y-8">
          {/* Header with animated icons */}
          <div className="relative">
            <div className="inline-flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Atom
                    className="h-8 w-8 text-white animate-spin"
                    style={{ animationDuration: "8s" }}
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md">
                <Code className="h-6 w-6 text-white" />
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Rocket className="h-7 w-7 text-white" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-4">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 text-sm font-medium">
                <Zap className="h-4 w-4 mr-2" />
                In Development
              </Badge>
              <Badge
                variant="outline"
                className="bg-white/80 backdrop-blur-sm border-emerald-200 text-emerald-700 px-4 py-2"
              >
                <Clock className="h-4 w-4 mr-2" />
                {estimatedTime}
              </Badge>
            </div>
          </div>

          {/* Progress section */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Rocket className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800">
                    Development Progress
                  </h3>
                  <p className="text-slate-600">
                    We are making great progress.
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-700">
                    Overall Completion
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Status indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="text-center p-3 bg-emerald-50 rounded-lg">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-emerald-700">
                    UI Design
                  </p>
                  <p className="text-xs text-emerald-600">Complete</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Code className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-blue-700">Backend</p>
                  <p className="text-xs text-blue-600">In Progress</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-purple-700">
                    Features
                  </p>
                  <p className="text-xs text-purple-600">Testing</p>
                </div>
                <div className="text-center p-3 bg-amber-50 rounded-lg">
                  <div className="w-8 h-8 bg-amber-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                  <p className="text-xs font-medium text-amber-700">
                    User Testing
                  </p>
                  <p className="text-xs text-amber-600">Planned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming features */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  What &apos s Coming
                </h3>
              </div>

              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                    <span className="text-slate-700 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 border-0 shadow-xl max-w-lg mx-auto">
            <CardContent className="p-6">
              <div className="text-center text-white space-y-4">
                <Bell className="h-8 w-8 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold">Stay Updated</h3>
                <p className="text-blue-100 text-sm">
                  We will notify you as soon as this feature is ready to
                  revolutionize your teaching experience!
                </p>
                <div className="flex gap-2 justify-center">
                  <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-white/60 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;
