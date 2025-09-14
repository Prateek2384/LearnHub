import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Award, Users, TrendingUp } from "lucide-react"
import Link from "next/link"
import { InstructorHeader } from "@/components/instructor/instructor-header"

export default async function QuizManagePage({ params }: { params: { courseId: string; quizId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get quiz details with questions
  const { data: quiz } = await supabase
    .from("quizzes")
    .select(`
      *,
      courses(title, instructor_id),
      quiz_questions(*)
    `)
    .eq("id", params.quizId)
    .single()

  if (!quiz || quiz.courses?.instructor_id !== user.id) {
    redirect("/instructor/dashboard")
  }

  // Get quiz attempts with student info
  const { data: attempts } = await supabase
    .from("quiz_attempts")
    .select(`
      *,
      student:profiles!quiz_attempts_student_id_fkey(full_name)
    `)
    .eq("quiz_id", params.quizId)
    .order("completed_at", { ascending: false })

  // Calculate stats
  const totalAttempts = attempts?.length || 0
  const averageScore = attempts?.length
    ? Math.round(
        attempts.reduce((sum, attempt) => sum + (attempt.score / attempt.total_questions) * 100, 0) / attempts.length,
      )
    : 0
  const passRate = attempts?.length
    ? Math.round(
        (attempts.filter((attempt) => (attempt.score / attempt.total_questions) * 100 >= 70).length / attempts.length) *
          100,
      )
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <InstructorHeader />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href={`/instructor/courses/${params.courseId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Link>
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{quiz.courses?.title}</p>
            </div>
          </div>
          {quiz.description && <p className="text-gray-600 mt-4">{quiz.description}</p>}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalAttempts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pass Rate</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{passRate}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Questions</CardTitle>
              <CardDescription>{quiz.quiz_questions?.length || 0} questions</CardDescription>
            </CardHeader>
            <CardContent>
              {quiz.quiz_questions && quiz.quiz_questions.length > 0 ? (
                <div className="space-y-4">
                  {quiz.quiz_questions
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((question, index) => (
                      <div key={question.id} className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">
                          {index + 1}. {question.question}
                        </h4>
                        <div className="space-y-1">
                          {question.options.map((option: string, optionIndex: number) => (
                            <div key={optionIndex} className="flex items-center gap-2 text-sm">
                              <span
                                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                  optionIndex === question.correct_answer
                                    ? "bg-green-100 text-green-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {String.fromCharCode(65 + optionIndex)}
                              </span>
                              <span
                                className={optionIndex === question.correct_answer ? "font-medium text-green-800" : ""}
                              >
                                {option}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-600">No questions added yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Attempts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Attempts</CardTitle>
              <CardDescription>Latest student submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {attempts && attempts.length > 0 ? (
                <div className="space-y-4">
                  {attempts.slice(0, 10).map((attempt) => {
                    const percentage = Math.round((attempt.score / attempt.total_questions) * 100)
                    const passed = percentage >= 70

                    return (
                      <div key={attempt.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{attempt.student?.full_name}</p>
                          <p className="text-sm text-gray-600">{new Date(attempt.completed_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={passed ? "default" : "destructive"}>{percentage}%</Badge>
                          <p className="text-sm text-gray-600 mt-1">
                            {attempt.score}/{attempt.total_questions}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-gray-600">No attempts yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
