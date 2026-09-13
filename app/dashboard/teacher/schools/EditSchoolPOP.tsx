"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Props = {
  school: { id: string; name: string; description: string | null; classes: { id: string }[] };
  onChanged: () => void;
};

const EditSchoolPOP = ({ school, onChanged }: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(school.name);
  const [description, setDescription] = useState(school.description ?? "");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Name cannot be empty");
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/schools/${school.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(body?.error ?? "Could not save changes");
      toast.success("School updated");
      setOpen(false);
      onChanged();
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/teacher/schools/${school.id}`, { method: "DELETE" });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(body?.error ?? "Could not delete this school");
      toast.success("School deleted");
      setOpen(false);
      onChanged();
      router.refresh();
    } finally {
      setSaving(false);
      setConfirming(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) {
          setConfirming(false);
          setName(school.name);
          setDescription(school.description ?? "");
        }
      }}
    >
      <DialogTrigger asChild>
        <button
          type="button"
          aria-label={`Edit ${school.name}`}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="w-full max-w-md">
        <DialogTitle asChild>
          <h2 className="mb-4 text-xl font-semibold">Edit school</h2>
        </DialogTitle>

        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">School name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            {confirming ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Delete for good?</span>
                <Button type="button" variant="destructive" size="sm" disabled={saving} onClick={remove}>
                  Yes, delete
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={saving || school.classes.length > 0}
                title={
                  school.classes.length > 0
                    ? "Remove this school's classes before deleting it"
                    : "Delete this school"
                }
                onClick={() => setConfirming(true)}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            )}

            <Button type="submit" disabled={saving} className="font-semibold">
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSchoolPOP;
