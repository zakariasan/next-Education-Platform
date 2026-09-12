"use client";
import React from "react";
import { BookUser, Users, Copy, Check } from "lucide-react";
import { GiTeacher } from "react-icons/gi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Class, User } from "@prisma/client";
import { toast } from "sonner";

type TeacherClassProps = {
  itemClass: Class & {
    teacher: User;          // 👈 relation
    students: User[];       // 👈 relation
  };
  index?: number;
};

const TINTS = [
  { grad: "from-primary to-primary/70", bg: "bg-primary/15", text: "text-primary" },
  { grad: "from-secondary to-secondary/70", bg: "bg-secondary/20", text: "text-secondary" },
  { grad: "from-accent to-accent/70", bg: "bg-accent/25", text: "text-accent-foreground" },
  { grad: "from-growth to-growth/70", bg: "bg-growth/15", text: "text-growth" },
];

const TeacherClass = ({ itemClass, index = 0 }: TeacherClassProps) => {
  const [copied, setCopied] = React.useState(false);
  const tint = TINTS[index % TINTS.length];

  const copyKey = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(itemClass.key);
    setCopied(true);
    toast.success("Class code copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Link href={`classes/${itemClass.id}`} className="block h-full">
      <Card className="cursor-pointer h-full overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out p-0 gap-0">
        <div className={`h-1.5 w-full bg-gradient-to-r ${tint.grad}`} />

        <CardHeader className="flex justify-between items-center px-4 pt-4">
          <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tint.grad} text-white shadow-sm flex items-center justify-center`}>
            <BookUser className="w-5 h-5" />
          </span>

          <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-1 text-muted-foreground">
            <GiTeacher />
            <span className="text-sm font-medium">{itemClass?.teacher.name}</span>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4 pt-3">
          <p className="font-bold text-xl text-foreground truncate">{itemClass.name}</p>
          <p className="text-sm text-muted-foreground border-b border-border mb-3 pb-3 truncate min-h-5">{itemClass?.description}</p>

          <div className="flex justify-between items-center text-sm">
            <span className={`flex items-center gap-1.5 font-medium ${tint.text}`}>
              <Users className="w-4 h-4" /> {itemClass?.students.length || 0} Students
            </span>
            <button
              onClick={copyKey}
              title="Copy class code"
              className="flex items-center gap-1.5 font-mono text-xs bg-muted hover:bg-muted/70 border border-dashed border-border rounded-md px-2 py-1 text-muted-foreground transition-colors duration-150 active:scale-[0.96] cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-growth" /> : <Copy className="w-3.5 h-3.5" />}
              {itemClass.key}
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeacherClass;
