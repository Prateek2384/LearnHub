import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen, Users, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { VirtualCourseList } from "@/components/performance/virtual-course-list"
import { Suspense } from "react"

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

async function getDashboardData(userId: string) {
  const supabase = await createClient()

  const { data: coursesData } = await supabase
    .from("courses")
    .select(`
      id,
      title,
      description,
      created_at,
      lectures(id, type),
      enrollments(count)
    `)
    .eq("instructor_id", userId)
    .order("created_at", { ascending: false })

  return coursesData || []
}

export default async function InstructorDashboard() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role, full_name").eq("id", user.id).single()

  if (!profile || profile.role !== "instructor") {
    redirect("/student/dashboard")
  }

  const courses = await getDashboardData(user.id)

  const stats = courses.reduce(
    (acc, course) => {
      const lectureCount = course.lectures?.length || 0
      const quizCount = course.lectures?.filter((l) => l.type === "quiz").length || 0
      const studentCount = course.enrollments?.[0]?.count || 0

      return {
        totalCourses: acc.totalCourses + 1,
        totalLectures: acc.totalLectures + lectureCount,
        totalQuizzes: acc.totalQuizzes + quizCount,
        totalStudents: acc.totalStudents + studentCount,
      }
    },
    { totalCourses: 0, totalLectures: 0, totalQuizzes: 0, totalStudents: 0 },
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back, {profile.full_name}!</h1>
          <p className="text-gray-600">Manage your courses and track student progress</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Lectures</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLectures}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Quizzes</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
            </CardContent>
          </Card>
        </div>

        {/* Courses Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
          <Link href="/instructor/courses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        {courses.length > 0 ? (
          <Suspense fallback={<DashboardSkeleton />}>
            <VirtualCourseList courses={courses} type="instructor" />
          </Suspense>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses yet</h3>
              <p className="text-gray-600 mb-6">Create your first course to start teaching and sharing knowledge</p>
              <Link href="/instructor/courses/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Course
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
