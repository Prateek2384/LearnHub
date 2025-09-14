import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Award } from "lucide-react"
import Link from "next/link"
import { StudentHeader } from "@/components/student/student-header"
import { OptimizedLectureList } from "@/components/performance/optimized-lecture-list"
import { Suspense } from "react"

async function getCourseData(courseId: string, userId: string) {
  const supabase = await createClient()

  const [enrollmentResult, courseResult, progressResult] = await Promise.all([
    supabase.from("enrollments").select("*").eq("student_id", userId).eq("course_id", courseId).single(),
    supabase
      .from("courses")
      .select(`
        *,
        instructor:profiles!courses_instructor_id_fkey(full_name),
        lectures(*),
        quizzes(*)
      `)
      .eq("id", courseId)
      .single(),
    supabase.from("student_progress").select("lecture_id, completed").eq("student_id", userId),
  ])

  return {
    enrollment: enrollmentResult.data,
    course: courseResult.data,
    progress: progressResult.data || [],
  }
}

function CourseDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-48 animate-pulse"></div>
            </div>
            <div className="text-right">
              <div className="h-8 bg-gray-200 rounded w-16 mb-1 animate-pulse"></div>
              <div className="h-3 bg-gray-200 rounded w-12 animate-pulse"></div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default async function StudentCoursePage({ params }: { params: { courseId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  const { enrollment, course, progress } = await getCourseData(params.courseId, user.id)

  if (!enrollment) {
    redirect("/student/browse")
  }

  if (!course) {
    redirect("/student/browse")
  }

  const progressMap = new Map(progress.map((p) => [p.lecture_id, p.completed]))

  const sortedLectures = course.lectures?.sort((a, b) => a.order_index - b.order_index) || []
  const completedCount = sortedLectures.filter((lecture) => progressMap.get(lecture.id)).length
  const progressPercent = sortedLectures.length > 0 ? (completedCount / sortedLectures.length) * 100 : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/student/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <p className="text-sm text-gray-600">Instructor: {course.instructor?.full_name}</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{Math.round(progressPercent)}%</div>
              <div className="text-sm text-gray-600">Complete</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lectures */}
          <div className="lg:col-span-2">
            <Suspense fallback={<CourseDetailSkeleton />}>
              <OptimizedLectureList
                lectures={sortedLectures}
                courseId={course.id}
                progressMap={progressMap}
                type="student"
              />
            </Suspense>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Course Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Lectures</span>
                      <span>
                        {completedCount}/{sortedLectures.length}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quizzes */}
            {course.quizzes && course.quizzes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Quizzes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {course.quizzes.map((quiz) => (
                      <div key={quiz.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{quiz.title}</h4>
                          <p className="text-sm text-gray-600">{quiz.description}</p>
                        </div>
                        <Link href={`/student/courses/${course.id}/quizzes/${quiz.id}`}>
                          <Button size="sm">Take Quiz</Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
