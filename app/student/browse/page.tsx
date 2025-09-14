import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users } from "lucide-react"
import Link from "next/link"
import { StudentHeader } from "@/components/student/student-header"
import { EnrollButton } from "@/components/student/enroll-button"
import { Suspense } from "react"

async function getBrowseData(userId: string) {
  const supabase = await createClient()

  const [coursesResult, enrollmentsResult] = await Promise.all([
    supabase
      .from("courses")
      .select(`
        id,
        title,
        description,
        created_at,
        instructor:profiles!courses_instructor_id_fkey(full_name),
        lectures(count),
        enrollments(count)
      `)
      .order("created_at", { ascending: false }),
    supabase.from("enrollments").select("course_id").eq("student_id", userId),
  ])

  return {
    courses: coursesResult.data || [],
    enrolledCourseIds: enrollmentsResult.data?.map((e) => e.course_id) || [],
  }
}

function BrowseSkeleton() {
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
              <div className="h-3 bg-gray-200 rounded w-20"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default async function BrowseCoursesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { courses, enrolledCourseIds } = await getBrowseData(user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Courses</h1>
          <p className="text-gray-600">Discover new courses and expand your knowledge</p>
        </div>

        {courses && courses.length > 0 ? (
          <Suspense fallback={<BrowseSkeleton />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id)
                const lectureCount = course.lectures?.[0]?.count || 0
                const studentCount = course.enrollments?.[0]?.count || 0

                return (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                      <CardDescription className="line-clamp-3">{course.description}</CardDescription>
                      <p className="text-sm text-gray-600">Instructor: {course.instructor?.full_name}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{lectureCount} lectures</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{studentCount} students</span>
                        </div>
                      </div>

                      {isEnrolled ? (
                        <Link href={`/student/courses/${course.id}`}>
                          <Button className="w-full">Continue Learning</Button>
                        </Link>
                      ) : (
                        <EnrollButton courseId={course.id} />
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </Suspense>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses available</h3>
              <p className="text-gray-600">Check back later for new courses</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
