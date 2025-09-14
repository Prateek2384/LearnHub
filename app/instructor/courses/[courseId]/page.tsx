import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus, BookOpen, Award } from "lucide-react"
import Link from "next/link"
import { InstructorHeader } from "@/components/instructor/instructor-header"
import { DeleteCourseButton } from "@/components/instructor/delete-course-button"

async function deleteCourse(courseId: string) {
  "use server"

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get all lecture IDs for this course
  const { data: lectures } = await supabase.from("lectures").select("id").eq("course_id", courseId)

  const lectureIds = lectures?.map((l) => l.id) || []

  if (lectureIds.length > 0) {
    // Delete in correct order due to foreign key constraints
    // 1. Delete lecture progress
    await supabase.from("lecture_progress").delete().in("lecture_id", lectureIds)

    // 2. Delete quiz attempts
    await supabase.from("quiz_attempts").delete().in("lecture_id", lectureIds)

    // 3. Delete quiz questions
    await supabase.from("quiz_questions").delete().in("lecture_id", lectureIds)

    // 4. Delete lectures
    await supabase.from("lectures").delete().eq("course_id", courseId)
  }

  // 5. Delete enrollments
  await supabase.from("enrollments").delete().eq("course_id", courseId)

  // 6. Finally delete the course
  const { error } = await supabase.from("courses").delete().eq("id", courseId).eq("instructor_id", user.id)

  if (error) {
    throw new Error("Failed to delete course")
  }

  redirect("/instructor/dashboard")
}

export default async function CourseManagePage({ params }: { params: { courseId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get course details
  const { data: course } = await supabase
    .from("courses")
    .select(`
      *,
      lectures(*),
      enrollments(count)
    `)
    .eq("id", params.courseId)
    .eq("instructor_id", user.id)
    .single()

  if (!course) {
    redirect("/instructor/dashboard")
  }

  const readingLectures = course.lectures?.filter((l) => l.type === "reading") || []
  const quizLectures = course.lectures?.filter((l) => l.type === "quiz") || []

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/instructor/dashboard"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
              <p className="text-gray-600 mt-2">{course.description}</p>
            </div>
            <DeleteCourseButton courseId={course.id} courseName={course.title} deleteCourse={deleteCourse} />
          </div>
        </div>

        {/* Course Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Reading Lectures</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{readingLectures.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quiz Lectures</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{quizLectures.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Students</CardTitle>
                  <CardDescription>Enrolled students in this course</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{course.enrollments?.[0]?.count || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Lectures</CardTitle>
                <CardDescription>Manage course content including reading materials and quizzes</CardDescription>
              </div>
              <Link href={`/instructor/courses/${course.id}/lectures/create`}>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lecture
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {course.lectures && course.lectures.length > 0 ? (
              <div className="space-y-3">
                {course.lectures
                  .sort((a, b) => a.order_index - b.order_index)
                  .map((lecture) => (
                    <div key={lecture.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            lecture.type === "quiz" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {lecture.type === "quiz" ? "Quiz" : "Reading"}
                        </div>
                        <div>
                          <h4 className="font-medium">{lecture.title}</h4>
                          <p className="text-sm text-gray-600">Order: {lecture.order_index}</p>
                        </div>
                      </div>
                      <Link href={`/instructor/courses/${course.id}/lectures/${lecture.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No lectures yet</p>
                <Link href={`/instructor/courses/${course.id}/lectures/create`}>
                  <Button size="sm">Create First Lecture</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
