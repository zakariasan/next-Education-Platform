import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateClassPOP from "./CreateClassPOP";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  Bell,
  MessageSquare,
  BarChart3,
  Activity,
  Target,
  Zap,
  CalendarDays,
  AlertCircle,
  Plus,
  Eye,
  Edit
} from "lucide-react";

import { User} from '@prisma/client';
const MainDashTeach = () => {
  const [dashboardData, setDashboardData] = useState({
    totalStudents: 0,
    totalClasses: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    avgAttendance: 0,
    totalAssignments: 0,
    leaderboard: []
  });





  // Mock data - replace with real API calls
  useEffect(() => {
    // Simulate loading dashboard data
    setDashboardData({
      totalStudents: 145,
      totalClasses: 8,
      upcomingSessions: 12,
      completedSessions: 34,
      avgAttendance: 87.5,
      totalAssignments: 23,
      leaderboard: []
    });
  }, []);



  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/teacher/dashboard");
        const data = await res.json();
        setDashboardData(data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };
    fetchData();
  }, []);



  const quickStats = [
    {
      title: "Total Students",
      value: dashboardData.totalStudents,
      icon: <Users className="h-6 w-6" />,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      change: "+12 this month"
    },
    {
      title: "Active Classes",
      value: dashboardData.totalClasses,
      icon: <BookOpen className="h-6 w-6" />,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-50",
      change: "+2 new classes"
    },
    {
      title: "Upcoming Sessions",
      value: dashboardData.upcomingSessions,
      icon: <Calendar className="h-6 w-6" />,
      color: "from-purple-500 to-indigo-500",
      bgColor: "bg-purple-50",
      change: "Next: Tomorrow 9:00 AM"
    },
    {
      title: "Attendance Rate",
      value: `${dashboardData.avgAttendance}%`,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      change: "+5.2% from last month"
    }
  ];

  const recentClasses = [
    { name: "Physics 101 - Mechanics", students: 32, attendance: "94%", nextSession: "Today 2:00 PM" },
    { name: "Advanced Quantum Physics", students: 18, attendance: "89%", nextSession: "Tomorrow 10:00 AM" },
    { name: "Lab: Wave Motion", students: 24, attendance: "91%", nextSession: "Wed 3:00 PM" }
  ];

  const upcomingEvents = [
    { title: "Physics Department Meeting", time: "Today 4:00 PM", type: "meeting" },
    { title: "Student Progress Review", time: "Tomorrow 11:00 AM", type: "review" },
    { title: "Lab Equipment Maintenance", time: "Friday 2:00 PM", type: "maintenance" }
  ];

  const announcements = [
    { message: "New lab equipment has arrived!", time: "2 hours ago", priority: "high" },
    { message: "Student evaluation forms due next week", time: "5 hours ago", priority: "medium" },
    { message: "Physics competition registration open", time: "1 day ago", priority: "low" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-20 items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Physics Teacher Dashboard
            </h1>
            <p className="text-slate-600 mt-1">Manage your classes and track student progress</p>
          </div>

        </div>

        {/* Welcome Section */}
        <Card className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 border-0 shadow-xl">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                    Welcome back, Professor! 👋
                  </h2>
                  <p className="text-slate-700 mt-2 text-lg">
                    Ready to inspire the next generation of physicists?
                  </p>
                </div>
                <div className="flex gap-3">
                  <CreateClassPOP />
                  <Button variant="outline" className="bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Schedule
                  </Button>
                </div>
              </div>
              <div className="hidden md:block relative">
                <div className="w-64 h-48 relative">
                  <Image
                    src="/Teacher.svg"
                    alt="Welcome Teacher"
                    width={250}
                    height={200}
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-2">{stat.change}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                    <div className="text-white">{stat.icon}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Recent Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentClasses.map((cls, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200/50 hover:bg-slate-100/50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-800">{cls.name}</h3>
                      <p className="text-sm text-slate-600">{cls.students} students • Attendance: {cls.attendance}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {cls.nextSession}
                      </Badge>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Classes
                </Button>
              </CardContent>
            </Card>

            {/* Progress Analytics */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  Student Progress Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <Target className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-emerald-700">89%</p>
                    <p className="text-sm text-emerald-600">Assignment Completion</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Award className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-blue-700">7.8</p>
                    <p className="text-sm text-blue-600">Average Grade</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Activity className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-purple-700">92%</p>
                    <p className="text-sm text-purple-600">Active Participation</p>
                  </div>
                  <div className="text-center p-4 bg-amber-50 rounded-lg">
                    <Zap className="h-8 w-8 text-amber-600 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-amber-700">156</p>
                    <p className="text-sm text-amber-600">Total XP Awarded</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">


            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-600" />
                  Student Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dashboardData?.leaderboard?.map((student: User, index: number) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-800">
                      #{index + 1} {student.name}
                    </span>
                    <span className="text-emerald-600 font-bold">{student.totalXP} XP</span>
                  </div>
                ))}
              </CardContent>
            </Card>


            {/* Upcoming Events */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-indigo-600" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`p-2 rounded-full ${event.type === 'meeting' ? 'bg-blue-100 text-blue-600' :
                        event.type === 'review' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-amber-100 text-amber-600'
                      }`}>
                      <Clock className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">{event.title}</p>
                      <p className="text-xs text-slate-600">{event.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              </CardContent>
            </Card>

            {/* Announcements */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {announcements.map((announcement, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className={`p-1 rounded-full ${announcement.priority === 'high' ? 'bg-red-100 text-red-600' :
                        announcement.priority === 'medium' ? 'bg-amber-100 text-amber-600' :
                          'bg-slate-100 text-slate-600'
                      }`}>
                      {announcement.priority === 'high' ? <AlertCircle className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-slate-800 text-sm">{announcement.message}</p>
                      <p className="text-xs text-slate-600">{announcement.time}</p>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Create Assignment
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <Award className="h-4 w-4 mr-2" />
                  Grade Submissions
                </Button>
                <Button variant="outline" className="w-full justify-start" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </CardContent>
            </Card>


          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashTeach;
