"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import EventsBoard from "@/components/EventsBoard";

type Cls = { id: string; name: string; schoolId: string | null };
type School = { id: string; name: string };

const TeacherEvents = ({ admin = false }: { admin?: boolean }) => {
  const { data: session } = useSession();
  const [classes, setClasses] = useState<Cls[]>([]);
  const [schools, setSchools] = useState<School[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      const [c, s] = await Promise.all([
        fetch(admin ? "/api/admin/schools" : "/api/teacher/classes"),
        fetch(admin ? "/api/admin/schools" : "/api/teacher/schools"),
      ]);
      if (admin) {
        const list = s.ok ? await s.json() : [];
        setSchools(list.map((x: School) => ({ id: x.id, name: x.name })));
        setClasses(list.flatMap((x: { id: string; classes: { id: string; name: string }[] }) => x.classes.map((k) => ({ ...k, schoolId: x.id }))));
      } else {
        if (c.ok) setClasses((await c.json()).map((x: Cls) => ({ id: x.id, name: x.name, schoolId: x.schoolId })));
        if (s.ok) setSchools((await s.json()).map((x: School) => ({ id: x.id, name: x.name })));
      }
    })();
  }, [session?.user?.id, admin]);

  return (
    <EventsBoard
      apiBase="/api/teacher/events"
      editable
      classes={classes}
      schools={schools}
      allowGlobal={admin}
      seanceLink={(e) => (e.seanceId && e.classId ? `/dashboard/teacher/classes/${e.classId}/seances/${e.seanceId}` : null)}
    />
  );
};

export default TeacherEvents;
