"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Award, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { StudentHeader } from "@/components/student/student-header"

interface Question {
  id: string
  question: string
  options: string[]
  correct_answer: number
  order_index: number
}

interface Quiz {
  id: string
  title: string
  description: string
  course_id: string
}

interface QuizAttempt {
  id: string
  score: number
  total_questions: number
  answers: number[]
  completed_at: string
}

export default function TakeQuizPage({ params }: { params: { courseId: string; quizId: string } }) {
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<number[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<QuizAttempt | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [courseName, setCourseName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchQuizData = async () => {
      const supabase = createClient()

      try {
        // Check enrollment
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) {
          router.push("/auth/login")
          return
        }

        const { data: enrollment } = await supabase
          .from("enrollments")
          .select("*")
          .eq("student_id", user.id)
          .eq("course_id", params.courseId)
          .single()

        if (!enrollment) {
          router.push("/student/browse")
          return
        }

        // Get course name
        const { data: course } = await supabase.from("courses").select("title").eq("id", params.courseId).single()
        if (course) setCourseName(course.title)

        // Get quiz details
        const { data: quizData } = await supabase.from("quizzes").select("*").eq("id", params.quizId).single()

        if (!quizData) {
          router.push(`/student/courses/${params.courseId}`)
          return
        }

        setQuiz(quizData)

        // Get questions
        const { data: questionsData } = await supabase
          .from("quiz_questions")
          .select("*")
          .eq("quiz_id", params.quizId)
          .order("order_index")

        if (questionsData) {
          setQuestions(questionsData)
          setAnswers(new Array(questionsData.length).fill(-1))
        }
      } catch (error) {
        console.error("Error fetching quiz data:", error)
        setError("Failed to load quiz")
      }
    }

    fetchQuizData()
  }, [params.courseId, params.quizId, router])

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      // Check if all questions are answered
      if (answers.some((answer) => answer === -1)) {
        throw new Error("Please answer all questions before submitting")
      }

      // Calculate score
      let score = 0
      questions.forEach((question, index) => {
        if (answers[index] === question.correct_answer) {
          score++
        }
      })

      // Save attempt
      const { data: attempt, error: attemptError } = await supabase
        .from("quiz_attempts")
        .insert({
          student_id: user.id,
          quiz_id: params.quizId,
          answers: answers,
          score: score,
          total_questions: questions.length,
        })
        .select()
        .single()

      if (attemptError) throw attemptError

      setResult(attempt)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (result) {
    const percentage = Math.round((result.score / result.total_questions) * 100)
    const passed = percentage >= 70

    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />

        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
                  {passed ? (
                    <CheckCircle className="h-16 w-16 text-green-600" />
                  ) : (
                    <XCircle className="h-16 w-16 text-red-600" />
                  )}
                </div>
                <CardTitle className="text-2xl">Quiz Complete!</CardTitle>
                <CardDescription>Here are your results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{percentage}%</div>
                  <div className="text-gray-600">
                    {result.score} out of {result.total_questions} correct
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold">Review Your Answers:</h3>
                  {questions.map((question, index) => {
                    const userAnswer = result.answers[index]
                    const isCorrect = userAnswer === question.correct_answer

                    return (
                      <div key={question.id} className="text-left p-4 border rounded-lg">
                        <div className="flex items-start gap-2 mb-2">
                          {isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                          )}
                          <div className="flex-1">
                            <p className="font-medium">{question.question}</p>
                            <p className="text-sm text-gray-600 mt-1">Your answer: {question.options[userAnswer]}</p>
                            {!isCorrect && (
                              <p className="text-sm text-green-600 mt-1">
                                Correct answer: {question.options[question.correct_answer]}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="flex gap-4 justify-center">
                  <Link href={`/student/courses/${params.courseId}`}>
                    <Button>Back to Course</Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setResult(null)
                      setAnswers(new Array(questions.length).fill(-1))
                    }}
                  >
                    Retake Quiz
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    )
  }

  if (!quiz || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <StudentHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading quiz...</div>
        </main>
      </div>
    )
  }

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
              <h1 className="text-3xl font-bold text-gray-900">{quiz.title}</h1>
              <p className="text-gray-600">{courseName}</p>
            </div>
          </div>
          {quiz.description && <p className="text-gray-600 mt-4">{quiz.description}</p>}
        </div>

        <form onSubmit={handleSubmit} className="max-w-3xl">
          <div className="space-y-8">
            {questions.map((question, questionIndex) => (
              <Card key={question.id}>
                <CardHeader>
                  <CardTitle>
                    Question {questionIndex + 1} of {questions.length}
                  </CardTitle>
                  <CardDescription>{question.question}</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={answers[questionIndex]?.toString() || ""}
                    onValueChange={(value) => handleAnswerChange(questionIndex, Number.parseInt(value))}
                  >
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center space-x-2">
                        <RadioGroupItem value={optionIndex.toString()} id={`q${questionIndex}-${optionIndex}`} />
                        <Label htmlFor={`q${questionIndex}-${optionIndex}`} className="flex-1 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mt-6">{error}</div>}

          <div className="mt-8 flex gap-4">
            <Button type="submit" disabled={isSubmitting || answers.some((answer) => answer === -1)}>
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
            <Link href={`/student/courses/${params.courseId}`}>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}
