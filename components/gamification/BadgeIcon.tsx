import React from "react";
import { Award, CircuitBoard, Compass, Crown, Gauge, RotateCcw, Star, Users, Zap } from "lucide-react";

const ICONS: Record<string, React.ElementType> = { Zap, CircuitBoard, Gauge, Users, Compass, RotateCcw, Star, Crown };

const BadgeIcon = ({ name, className = "w-5 h-5" }: { name: string; className?: string }) => {
  const Icon = ICONS[name] ?? Award;
  return <Icon className={className} />;
};

export default BadgeIcon;
