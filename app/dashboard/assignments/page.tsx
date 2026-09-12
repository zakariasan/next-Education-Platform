"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Code, 
  Atom, 
  Clock, 
  Zap, 
  ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

const ComingSoonPage: React.FC = () => {
  const { data: session, status } = useSession();
  const [particles, setParticles] = useState<
    Array<{ id: number; x: number; y: number; delay: number }>
  >([]);

  // Get role from session
  const role = session?.user?.role as "TEACHER" | "STUDENT" | undefined;

  // Config based on role
  const config = role === "TEACHER"
    ? {
        title: "Assignments Dashboard",
        description: "Easily create, assign, and track assignments for your students.",
        backUrl: "/dashboard/teacher",
      }
    : {
        title: "Assignments Page",
        description: "Soon you'll be able to view, submit, and track your assignments.",
        backUrl: "/dashboard/student",
      };

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

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 relative overflow-hidden">
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute w-2 h-2 bg-primary/20 rounded-full animate-pulse"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Back button */}
        <div className="mb-8">
          <Button
            variant="outline"
            asChild
            className="bg-white/80 backdrop-blur-sm border-white/30 hover:bg-white/90"
          >
            <Link href={config.backUrl}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        {/* Title & description */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
              <Atom className="h-8 w-8 text-primary-foreground animate-spin" style={{ animationDuration: "8s" }} />
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-secondary to-secondary/80 rounded-xl flex items-center justify-center shadow-md">
              <Code className="h-6 w-6 text-secondary-foreground" />
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-primary/80 to-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Rocket className="h-7 w-7 text-primary-foreground" />
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-primary/80 bg-clip-text text-transparent">
            {config.title}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">{config.description}</p>

          <div className="flex justify-center gap-3 mt-6">
            <Badge className="bg-gradient-to-r from-primary to-secondary text-primary-foreground px-4 py-2 text-sm font-medium">
              <Zap className="h-4 w-4 mr-2" />
              In Development
            </Badge>
            <Badge variant="outline" className="bg-card/80 backdrop-blur-sm border-secondary/30 text-secondary-foreground px-4 py-2">
              <Clock className="h-4 w-4 mr-2" />
              Coming Soon
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;

