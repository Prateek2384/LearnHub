"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { BookOpen, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function InstructorHeader() {
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Left side logo + title */}
        <Link href="/instructor/dashboard" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-foreground">LearnHub</span>
          <span className="text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">
            Instructor
          </span>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/instructor/dashboard" className="text-foreground/80 hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/instructor/courses" className="text-foreground/80 hover:text-foreground">
            Courses
          </Link>
        </nav>

        {/* Direct Sign Out button */}
        <Button variant="destructive" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </header>
  )
}
