// app/teacher/classes/[id]/exams/new/page.tsx
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type ExamFormData = {
  title: string;
  description: string;
  type: "MIDTERM" | "FINAL" | "LOCAL" | "CUSTOM";
  date: Date | undefined;
  maxScore: number;
  maxXP: number;
};

export default function CreateExam() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const classId = params.id;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ExamFormData>({
    title: "",
    description: "",
    type: "LOCAL",
    date: undefined,
    maxScore: 20,
    maxXP: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/teacher/classes/${classId}/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          date: formData.date?.toISOString(),
        }),
      });

      if (response.ok) {
        const exam = await response.json();
        router.push(`/dashboard/teacher/classes/${classId}/exams/${exam.id}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create exam");
      }
    } catch (error) {
      console.error("Error creating exam:", error);
      alert("Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (
    field: keyof ExamFormData,
    value: Date | number | string,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6  mx-auto bg-white p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Exam</h1>
        <p className="text-muted-foreground">
          Set up a new exam for your class
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Exam Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Enter exam title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="Optional description..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => updateFormData("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOCAL">Local Exam</SelectItem>
                    <SelectItem value="MIDTERM">Midterm</SelectItem>
                    <SelectItem value="FINAL">Final Exam</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date
                        ? format(formData.date, "PPP")
                        : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) =>
                        updateFormData("date", date ?? new Date())
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxScore">Max Score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min="1"
                  value={formData.maxScore}
                  onChange={(e) =>
                    updateFormData("maxScore", parseInt(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxXP">Max XP Reward</Label>
                <Input
                  id="maxXP"
                  type="number"
                  min="1"
                  value={formData.maxXP}
                  onChange={(e) =>
                    updateFormData("maxXP", parseInt(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Exam"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
