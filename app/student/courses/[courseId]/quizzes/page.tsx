import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, Clock } from "lucide-react"
import Link from "next/link"
import { StudentHeader } from "@/components/student/student-header"

export default async function CourseQuizzesPage({ params }: { params: { courseId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("course_id", params.courseId)
    .single()

  if (!enrollment) {
    redirect("/student/browse")
  }

  // Get course details
  const { data: course } = await supabase.from("courses").select("title").eq("id", params.courseId).single()

  // Get quizzes for this course
  const { data: quizzes } = await supabase
    .from("quizzes")
    .select(`
      *,
      quiz_questions(count)
    `)
    .eq("course_id", params.courseId)
    .order("created_at", { ascending: false })

  // Get user's quiz attempts
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score, total_questions, completed_at")
    .eq("student_id", user.id)

  const attemptMap = new Map(attempts?.map((a) => [a.quiz_id, a]) || [])

  return (
    <div className="min-h-screen bg-gray-50">
      <StudentHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/student/courses/${params.courseId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Course Quizzes</h1>
              <p className="text-gray-600">{course?.title}</p>
            </div>
          </div>
        </div>

        {quizzes && quizzes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quizzes.map((quiz) => {
              const attempt = attemptMap.get(quiz.id)
              const questionCount = quiz.quiz_questions?.[0]?.count || 0
              const hasAttempted = !!attempt
              const score = attempt ? Math.round((attempt.score / attempt.total_questions) * 100) : 0

              return (
                <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="line-clamp-2">{quiz.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">{quiz.description}</CardDescription>
                      </div>
                      {hasAttempted && <Badge variant={score >= 70 ? "default" : "destructive"}>{score}%</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>{questionCount} questions</span>
                        {hasAttempted && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                          </div>
                        )}
                      </div>

                      {hasAttempted && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-sm">
                            <div className="flex justify-between">
                              <span>Score:</span>
                              <span className="font-medium">
                                {attempt.score}/{attempt.total_questions}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span>Percentage:</span>
                              <span className="font-medium">{score}%</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <Link href={`/student/courses/${params.courseId}/quizzes/${quiz.id}`}>
                        <Button className="w-full">{hasAttempted ? "Retake Quiz" : "Take Quiz"}</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="text-center py-12">
            <CardContent>
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No quizzes available</h3>
              <p className="text-gray-600">The instructor hasn't added any quizzes yet</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
