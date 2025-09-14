import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, TrendingUp, Search } from "lucide-react"
import Link from "next/link"
import { StudentHeader } from "@/components/student/student-header"
import { VirtualCourseList } from "@/components/performance/virtual-course-list"
import { Suspense } from "react"

async function getStudentDashboardData(userId: string) {
  const supabase = await createClient()

  const [enrollmentData, progressData, quizAttemptsData] = await Promise.all([
    supabase
      .from("enrollments")
      .select(`
        id,
        course_id,
        courses!inner(
          id,
          title,
          description,
          lectures(id, type),
          instructor:profiles!courses_instructor_id_fkey(full_name)
        )
      `)
      .eq("student_id", userId),
    supabase.from("student_progress").select("lecture_id, completed").eq("student_id", userId),
    supabase.from("quiz_attempts").select("quiz_id, score, total_questions").eq("student_id", userId),
  ])

  return {
    enrollments: enrollmentData.data || [],
    progress: progressData.data || [],
    quizAttempts: quizAttemptsData.data || [],
  }
}

export default async function StudentDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect("/instructor/dashboard")
  }

  const { enrollments, progress, quizAttempts } = await getStudentDashboardData(user.id)

  const stats = enrollments.reduce(
    (acc, enrollment) => {
      const course = enrollment.courses
      const totalLectures = course.lectures?.length || 0
      const completedLectures = progress.filter(
        (p) => course.lectures?.some((l) => l.id === p.lecture_id) && p.completed,
      ).length

      return {
        totalEnrolled: acc.totalEnrolled + 1,
        totalCompleted: acc.totalCompleted + completedLectures,
      }
    },
    { totalEnrolled: 0, totalCompleted: 0 },
  )

  const averageScore = quizAttempts.length
    ? Math.round(
        quizAttempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions) * 100, 0) /
          quizAttempts.length,
      )
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.full_name}!</h1>
          <p className="text-gray-600">Continue your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEnrolled}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Lectures</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCompleted}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quizzes Taken</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizAttempts.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Enrolled Courses */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
              <Link href="/student/browse">
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Courses
                </Button>
              </Link>
            </div>

            {enrollments.length > 0 ? (
              <Suspense fallback={<div>Loading courses...</div>}>
                <VirtualCourseList
                  courses={enrollments.map((e) => e.courses)}
                  type="student"
                  enrolledCourseIds={enrollments.map((e) => e.course_id)}
                  progressData={progress}
                />
              </Suspense>
            ) : (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses enrolled yet</h3>
                  <p className="text-gray-600 mb-6">Discover amazing courses and start your learning journey</p>
                  <Link href="/student/browse">
                    <Button>
                      <Search className="h-4 w-4 mr-2" />
                      Browse Courses
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Learning Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Courses Enrolled</span>
                    <span className="font-semibold">{stats.totalEnrolled}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Lectures Completed</span>
                    <span className="font-semibold">{stats.totalCompleted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Quizzes Taken</span>
                    <span className="font-semibold">{quizAttempts.length}</span>
                  </div>
                  {averageScore > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Average Score</span>
                      <span className="font-semibold text-green-600">{averageScore}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
