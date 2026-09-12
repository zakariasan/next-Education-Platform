import Link from "next/link";
import { Button } from "@/components/ui/button";
import PhysicsFloat from "@/components/PhysicsFloat";
import {
  BookOpen,
  Users,
  Trophy,
  GraduationCap,
  Star,
  Flame,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Bell,
} from "lucide-react";

const WEEK_ACTIVITY = [40, 65, 45, 80, 55, 90, 70];

const FEATURES = [
  {
    icon: BookOpen,
    title: "Interactive Lessons",
    description: "Engage with dynamic content and real-time feedback",
    gradient: "from-primary to-primary/70",
  },
  {
    icon: Trophy,
    title: "Achievement System",
    description: "Earn XP and badges as you progress",
    gradient: "from-accent to-accent/70",
  },
  {
    icon: Users,
    title: "Collaborative Learning",
    description: "Connect with peers and study together",
    gradient: "from-secondary to-secondary/70",
  },
  {
    icon: TrendingUp,
    title: "Progress Analytics",
    description: "Track your learning journey with detailed insights",
    gradient: "from-[var(--primary-wild-watermelon)] to-primary",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0e27] text-white bg-[radial-gradient(ellipse_120%_80%_at_50%_-10%,rgba(50,64,205,0.35),transparent),radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(50,200,189,0.15),transparent)]">
      {/* Navigation */}
      <nav className="w-full px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none">PhysiClub</h1>
              <p className="text-xs text-white/50">Learn. Grow. Achieve.</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-white/60 hover:text-white transition-colors font-medium">
              Features
            </Link>
            <Link href="#about" className="text-white/60 hover:text-white transition-colors font-medium">
              About
            </Link>
            <Link href="/auth/login" className="text-white/60 hover:text-white transition-colors font-medium">
              Sign In
            </Link>
            <Button asChild size="sm" className="bg-gradient-to-r from-primary to-secondary shadow-lg shadow-primary/30 border-0">
              <Link href="/auth/register">Get Started</Link>
            </Button>
          </div>

          <Button asChild size="sm" className="md:hidden bg-gradient-to-r from-primary to-secondary border-0">
            <Link href="/auth/login">Sign In</Link>
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative max-w-7xl mx-auto px-6 pt-12 pb-24 overflow-hidden">
        <PhysicsFloat />

        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute -top-24 -left-24 w-[420px] h-[420px] bg-primary/25 rounded-full blur-[100px]" />
          <div className="absolute top-1/3 -right-24 w-[420px] h-[420px] bg-secondary/20 rounded-full blur-[100px]" />
        </div>

        <div className="relative grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold text-white/80">
                <Sparkles className="w-4 h-4 text-accent" />
                A smarter way to teach and learn
              </div>

              <h1 className="text-5xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                <span className="text-white">Learn</span>
                <br />
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  without limits
                </span>
              </h1>

              <p className="text-lg text-white/60 leading-relaxed max-w-lg">
                One place for teachers to run their classroom and for students to
                keep up: lessons, quizzes, exams and progress, all in sync.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-secondary border-0 shadow-xl shadow-primary/30 hover:shadow-primary/50 transition-all hover:-translate-y-0.5 group"
              >
                <Link href="/auth/register">
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>

              <Button
                asChild
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold border-2 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/auth/login">Sign In</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 pt-4">
              <div>
                <div className="text-2xl font-bold text-primary">Classrooms</div>
                <div className="text-sm text-white/50">Built for teachers</div>
              </div>
              <div className="h-8 w-px bg-white/15" />
              <div>
                <div className="text-2xl font-bold text-secondary">Progress</div>
                <div className="text-sm text-white/50">Tracked for students</div>
              </div>
            </div>
          </div>

          {/* Right Content - Glass dashboard preview */}
          <div className="relative flex items-center justify-center min-h-[440px]">
            {/* Glass card */}
            <div className="relative w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-sm font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-none">Good morning, Alex</p>
                    <p className="text-xs text-white/50 mt-1">Here&apos;s your class today</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-white/60" />
                </div>
              </div>

              <div className="relative">
                <p className="text-3xl font-extrabold">128</p>
                <p className="text-xs text-white/50">Students active this week</p>

                <div className="absolute -top-1 right-0 bg-secondary text-[#0a0e27] text-xs font-bold px-2 py-1 rounded-lg shadow-md shadow-secondary/40">
                  +18%
                </div>
              </div>

              {/* Mini bar chart */}
              <div className="flex items-end gap-1.5 h-16">
                {WEEK_ACTIVITY.map((h, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-md ${i === WEEK_ACTIVITY.length - 2 ? "bg-gradient-to-t from-primary to-secondary shadow-lg shadow-primary/40" : "bg-white/10"}`}
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>

              {/* Stat pills */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-primary/90 px-3 py-2.5 shadow-lg shadow-primary/30">
                  <p className="text-lg font-bold leading-none">12</p>
                  <p className="text-xs opacity-80 mt-1">Classes</p>
                </div>
                <div className="rounded-xl bg-accent text-[#0a0e27] px-3 py-2.5 shadow-lg shadow-accent/30">
                  <p className="text-lg font-bold leading-none">92%</p>
                  <p className="text-xs opacity-80 mt-1">Avg. score</p>
                </div>
              </div>
            </div>

            {/* Floating badge — achievement */}
            <div className="absolute top-0 right-2 w-14 h-14 bg-gradient-to-br from-accent to-[var(--primary-wild-watermelon)] rounded-2xl flex items-center justify-center shadow-xl shadow-accent/30 rotate-6 animate-float-slow">
              <Star className="w-7 h-7 text-white" fill="currentColor" />
            </div>

            {/* Floating pill — streak */}
            <div className="absolute bottom-2 left-0 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3 animate-float-slow [animation-delay:0.8s]">
              <div className="w-9 h-9 rounded-xl bg-secondary/20 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm font-bold leading-none">7-day</p>
                <p className="text-xs text-white/50 mt-0.5">Streak</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div id="features" className="relative mt-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-3">Everything your classroom needs</h2>
            <p className="text-white/50">Built for teachers who teach and students who learn — together.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, description, gradient }) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-base font-bold mb-1">{title}</h3>
                <p className="text-sm text-white/50">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer id="about" className="relative border-t border-white/10">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-primary via-secondary to-accent" />
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">PhysiClub</span>
            </div>
            <p className="text-white/50 mb-6">
              Empowering education through simple, focused tools
            </p>
            <p className="text-xs text-white/30">
              © 2026 PhysiClub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
