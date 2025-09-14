import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, Award, TrendingUp } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-foreground">LearnHub</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="secondary">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-foreground mb-6 text-balance">Transform Your Learning Journey</h2>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto text-pretty">
            Join thousands of students and instructors in our comprehensive online learning platform. Create courses,
            take quizzes, and track your progress.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="px-8">
                Start Learning Today
              </Button>
            </Link>
            <Link href="/auth/signup?role=instructor">
              <Button size="lg" variant="secondary" className="px-8">
                Become an Instructor
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Interactive Courses</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Engage with comprehensive course materials and video lectures</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Auto-Graded Quizzes</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Test your knowledge with instant feedback and scoring</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Progress Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Monitor your learning progress and achievements</CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Expert Instructors</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Learn from industry professionals and experienced educators</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center bg-card rounded-2xl p-12 shadow-lg">
          <h3 className="text-3xl font-bold text-foreground mb-4">Ready to Start Learning?</h3>
          <p className="text-foreground/80 mb-8 max-w-xl mx-auto">
            Join our community of learners and instructors. Create your account and begin your educational journey
            today.
          </p>
          <Link href="/auth/signup">
            <Button size="lg" className="px-12">
              Create Free Account
            </Button>
          </Link>
        </div>
      </main>
    </div>
  )
}
