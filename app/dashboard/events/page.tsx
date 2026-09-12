"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Code,
  CalendarDays,
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
  const title = "Events — Coming Soon";
  const description =
    "We're crafting something amazing to bring events into your classroom experience";
  const features = [
    "Real-time student progress tracking",
    "Interactive class activities",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Floating decorative icons */}
      <div className="absolute inset-0 pointer-events-none">
        <Sparkles
          className="absolute top-20 left-10 w-12 h-12 text-primary/20 animate-bounce"
          style={{ animationDuration: "3s" }}
        />
        <Star
          className="absolute top-40 right-20 w-10 h-10 text-secondary/20 animate-bounce"
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        />
        <CalendarDays
          className="absolute bottom-32 left-20 w-9 h-9 text-secondary/20 animate-bounce"
          style={{ animationDuration: "3.5s", animationDelay: "2s" }}
        />
        <Lightbulb
          className="absolute top-60 left-1/2 w-8 h-8 text-accent/30 animate-bounce"
          style={{ animationDuration: "2.8s", animationDelay: "0.5s" }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="outline"
            asChild
            className="bg-card/80 backdrop-blur-sm border-border hover:bg-card"
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
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <CalendarDays
                    className="h-8 w-8 text-primary-foreground animate-spin"
                    style={{ animationDuration: "8s" }}
                  />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center">
                  <Sparkles className="h-3 w-3 text-accent-foreground" />
                </div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-md">
                <Code className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-primary/80 to-primary rounded-2xl flex items-center justify-center shadow-lg">
                <Rocket className="h-7 w-7 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent mb-4">
              {title}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {description}
            </p>

            <div className="flex justify-center gap-3 mt-6">
              <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 text-sm font-medium">
                <Zap className="h-4 w-4 mr-2" />
                In Development
              </Badge>
              <Badge
                variant="outline"
                className="bg-card/80 backdrop-blur-sm border-secondary/30 text-secondary-foreground px-4 py-2"
              >
                <Clock className="h-4 w-4 mr-2" />
                {estimatedTime}
              </Badge>
            </div>
          </div>

          {/* Progress section */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
                  <Rocket className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    Development Progress
                  </h3>
                  <p className="text-muted-foreground">
                    We are making great progress.
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground/80">
                    Overall Completion
                  </span>
                  <span className="text-lg font-bold text-primary">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary via-primary to-secondary rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-foreground/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* Status indicators */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="text-center p-3 bg-secondary/10 rounded-lg">
                  <div className="w-8 h-8 bg-secondary rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Star className="h-4 w-4 text-secondary-foreground" />
                  </div>
                  <p className="text-xs font-medium text-secondary-foreground">
                    UI Design
                  </p>
                  <p className="text-xs text-secondary">Complete</p>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Code className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <p className="text-xs font-medium text-primary">Backend</p>
                  <p className="text-xs text-primary/80">In Progress</p>
                </div>
                <div className="text-center p-3 bg-primary/10 rounded-lg">
                  <div className="w-8 h-8 bg-primary/80 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <p className="text-xs font-medium text-primary/90">
                    Features
                  </p>
                  <p className="text-xs text-primary/70">Testing</p>
                </div>
                <div className="text-center p-3 bg-accent/10 rounded-lg">
                  <div className="w-8 h-8 bg-accent rounded-full mx-auto mb-2 flex items-center justify-center">
                    <Users className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <p className="text-xs font-medium text-accent-foreground">
                    User Testing
                  </p>
                  <p className="text-xs text-accent">Planned</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming features */}
          <Card className="bg-card/80 backdrop-blur-sm border-border shadow-xl max-w-2xl mx-auto">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-secondary to-secondary/80 rounded-lg">
                  <Sparkles className="h-5 w-5 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  What&apos;s Coming
                </h3>
              </div>

              <div className="grid gap-3">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors"
                  >
                    <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full"></div>
                    <span className="text-foreground/80 font-medium">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Call to action */}
          <Card className="bg-gradient-to-r from-primary via-primary to-secondary border-0 shadow-xl max-w-lg mx-auto">
            <CardContent className="p-6">
              <div className="text-center text-primary-foreground space-y-4">
                <Bell className="h-8 w-8 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold">Stay Updated</h3>
                <p className="text-primary-foreground/80 text-sm">
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
