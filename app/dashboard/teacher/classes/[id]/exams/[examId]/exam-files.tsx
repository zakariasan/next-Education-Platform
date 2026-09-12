// app/teacher/classes/[id]/exams/[examId]/exam-files.tsx
"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Plus,
  FileCheck,
  FileQuestion,
  FileX,
  File,
} from "lucide-react";
import { format } from "date-fns";

type ExamFile = {
  id: string;
  name: string;
  url: string;
  kind: string;
  createdAt: string;
};

interface ExamFilesProps {
  examId: string;
  classId: string;
  files: ExamFile[];
  onFilesUpdate?: () => void;
}

export default function ExamFiles({
  examId,
  classId,
  files,
  onFilesUpdate,
}: ExamFilesProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [fileKind, setFileKind] = useState<string>("OTHER");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", fileName);
      formData.append("kind", fileKind);

      const response = await fetch(
        `/api/teacher/classes/${classId}/exams/${examId}/files`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      // Reset form
      setSelectedFile(null);
      setFileName("");
      setFileKind("OTHER");
      setUploadDialogOpen(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onFilesUpdate) {
        onFilesUpdate();
      }

      alert("File uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;

    try {
      const response = await fetch(
        `/api/teacher/classes/${classId}/exams/${examId}/files/${fileId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete file");
      }

      if (onFilesUpdate) {
        onFilesUpdate();
      }

      alert("File deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete file");
    }
  };

  const getFileIcon = (kind: string) => {
    switch (kind) {
      case "STATEMENT":
        return <FileText className="h-4 w-4 text-primary" />;
      case "CORRECTION":
        return <FileCheck className="h-4 w-4 text-secondary" />;
      case "RUBRIC":
        return <FileQuestion className="h-4 w-4 text-accent" />;
      default:
        return <File className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getKindBadge = (kind: string) => {
    switch (kind) {
      case "STATEMENT":
        return <Badge variant="default">Statement</Badge>;
      case "CORRECTION":
        return (
          <Badge variant="default" className="bg-secondary/15 text-secondary">
            Correction
          </Badge>
        );
      case "RUBRIC":
        return (
          <Badge variant="default" className="bg-accent/20 text-accent-foreground">
            Rubric
          </Badge>
        );
      default:
        return <Badge variant="secondary">Other</Badge>;
    }
  };

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toUpperCase() || "";
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Exam Files ({files.length})
          </CardTitle>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Upload File
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Exam File</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Select File</Label>
                  <Input
                    id="file"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {selectedFile.name} (
                      {Math.round(selectedFile.size / 1024)}KB)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    placeholder="Enter file name..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>File Type</Label>
                  <Select value={fileKind} onValueChange={setFileKind}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="STATEMENT">Exam Statement</SelectItem>
                      <SelectItem value="CORRECTION">
                        Correction/Answer Key
                      </SelectItem>
                      <SelectItem value="RUBRIC">Grading Rubric</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedFile || !fileName || uploading}
                    className="flex-1"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setUploadDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {files.length === 0 ? (
            <div className="text-center py-8">
              <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No files uploaded yet</p>
              <p className="text-sm text-muted-foreground">
                Upload exam statements, corrections, or other materials
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.kind)}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{file.name}</span>
                        {getKindBadge(file.kind)}
                        <Badge variant="outline" className="text-xs">
                          {getFileExtension(file.name)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Uploaded{" "}
                        {format(
                          new Date(file.createdAt),
                          "MMM d, yyyy 'at' h:mm a",
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      className="text-destructive hover:text-destructive/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Types Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">File Type Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="font-medium">Statement:</span>
                <span className="text-muted-foreground">Exam questions</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-secondary" />
                <span className="font-medium">Correction:</span>
                <span className="text-muted-foreground">Answer keys</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileQuestion className="h-4 w-4 text-accent" />
                <span className="font-medium">Rubric:</span>
                <span className="text-muted-foreground">Grading criteria</span>
              </div>
              <div className="flex items-center gap-2">
                <File className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Other:</span>
                <span className="text-muted-foreground">
                  Additional materials
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
