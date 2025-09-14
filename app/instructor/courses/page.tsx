import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, BookOpen } from "lucide-react"
import Link from "next/link"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { VirtualCourseList } from "@/components/performance/virtual-course-list"
import { Suspense } from "react"

async function getInstructorCourses(userId: string) {
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

function CoursesListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-2/3"></div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between mb-4">
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
              <div className="h-3 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
              <div className="h-8 bg-gray-200 rounded flex-1"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function InstructorCoursesPage() {
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

  const courses = await getInstructorCourses(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Manage all your courses and track student progress</p>
          </div>
          <Link href="/instructor/courses/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </Link>
        </div>

        {courses.length > 0 ? (
          <Suspense fallback={<CoursesListSkeleton />}>
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
