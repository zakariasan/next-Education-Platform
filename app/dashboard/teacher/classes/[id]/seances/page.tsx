"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { MdRecordVoiceOver } from "react-icons/md";
import { IoCalendarSharp } from "react-icons/io5";
import { ClockArrowUp } from 'lucide-react';
import { ClockArrowDown } from 'lucide-react';
import { Plus, BookOpen, Calendar, Clock } from 'lucide-react';
import {Seance} from "@prisma/client"

export default function SeancesPage() {
  const params = useParams();
  const classId = params.id as string;
  const [seances, setSeances] = useState<Seance[]>([]);

  useEffect(() => {
    fetch(`/api/teacher/classes/${classId}/seances`)
      .then((res) => res.json())
      .then(setSeances);
  }, [classId]);

  const upcomingSessions = seances.filter(seance => new Date(seance.startsAt) > new Date()).length;
  const completedSessions = seances.filter(seance => new Date(seance.startsAt) < new Date()).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-slate-600">Learning Sessions</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Session Management
            </h1>
            <p className="text-slate-600">
              Manage and track all your class sessions in one place
            </p>
          </div>
          
          <Button 
            asChild 
            className="bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link href={`/dashboard/teacher/classes/${classId}/seances/create`}>
              <Plus className="h-5 w-5 mr-2" />
              Create New Session
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-slate-900">{seances.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <ClockArrowUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Upcoming</p>
                  <p className="text-2xl font-bold text-slate-900">{upcomingSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <ClockArrowDown className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Completed</p>
                  <p className="text-2xl font-bold text-slate-900">{completedSessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Grid */}
        {seances.length === 0 ? (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No Sessions Yet</h3>
              <p className="text-slate-500 mb-6">
                Get started by creating your first learning session for this class.
              </p>
              <Button 
                asChild 
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href={`/dashboard/teacher/classes/${classId}/seances/create`}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {seances.map((seance) => {
              const isUpcoming = new Date(seance.startsAt) > new Date();
              const sessionDate = new Date(seance.startsAt);
              
              return (
                <Card 
                  key={seance.id} 
                  className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                >
                  <Link href={`/dashboard/teacher/classes/${classId}/seances/${seance.id}`}>
                    <CardHeader className="pb-4">
                      <CardTitle className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-3 rounded-full ${isUpcoming ? 'bg-emerald-100 text-emerald-600' : 'bg-purple-100 text-purple-600'} group-hover:scale-110 transition-transform duration-300`}>
                            <MdRecordVoiceOver className="h-5 w-5" />
                          </div>
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${isUpcoming ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-700 border border-slate-200'}`}>
                            <IoCalendarSharp className="h-4 w-4" />
                            {sessionDate.toLocaleDateString()}
                          </div>
                        </div>
                        {isUpcoming && (
                          <div className="px-2 py-1 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold rounded-full">
                            Upcoming
                          </div>
                        )}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div className="min-h-[4rem] flex items-center">
                        <h3 className="font-bold text-xl md:text-2xl text-slate-800 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
                          {seance.title}
                        </h3>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-slate-200/50">
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                          <ClockArrowUp className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg">
                          <ClockArrowDown className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-medium text-slate-700">
                            {seance.endsAt 
                              ? new Date(seance.endsAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'No end time'
                            }
                          </span>
                        </div>
                      </div>

                      {/* Duration indicator */}
                      {seance.endsAt && (
                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">
                          <Clock className="h-3 w-3" />
                          Duration: {Math.round((new Date(seance.endsAt).getTime() - new Date(seance.startsAt).getTime()) / (1000 * 60))} minutes
                        </div>
                      )}
                    </CardContent>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
