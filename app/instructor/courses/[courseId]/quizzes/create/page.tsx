"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { InstructorHeader } from "@/components/instructor/instructor-header"

interface Question {
  question: string
  options: string[]
  correctAnswer: number
}

export default function CreateQuizPage({ params }: { params: { courseId: string } }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [questions, setQuestions] = useState<Question[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [courseName, setCourseName] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchCourse = async () => {
      const supabase = createClient()
      const { data: course } = await supabase.from("courses").select("title").eq("id", params.courseId).single()
      if (course) {
        setCourseName(course.title)
      }
    }
    fetchCourse()
  }, [params.courseId])

  const addQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }])
  }

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: keyof Question, value: string | number | string[]) => {
    const updated = [...questions]
    updated[index] = { ...updated[index], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions]
    updated[questionIndex].options[optionIndex] = value
    setQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // Validate questions
      for (const q of questions) {
        if (!q.question.trim()) throw new Error("All questions must have text")
        if (q.options.some((opt) => !opt.trim())) throw new Error("All options must be filled")
      }

      // Create quiz
      const { data: quiz, error: quizError } = await supabase
        .from("quizzes")
        .insert({
          course_id: params.courseId,
          title,
          description,
        })
        .select()
        .single()

      if (quizError) throw quizError

      // Create questions
      const questionsData = questions.map((q, index) => ({
        quiz_id: quiz.id,
        question: q.question,
        options: q.options,
        correct_answer: q.correctAnswer,
        order_index: index + 1,
      }))

      const { error: questionsError } = await supabase.from("quiz_questions").insert(questionsData)

      if (questionsError) throw questionsError

      router.push(`/instructor/courses/${params.courseId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Create New Quiz</h1>
          <p className="text-gray-600 mt-2">Add a quiz to "{courseName}"</p>
        </div>

        <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
          {/* Quiz Details */}
          <Card>
            <CardHeader>
              <CardTitle>Quiz Information</CardTitle>
              <CardDescription>Basic details about your quiz</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Quiz Title</Label>
                <Input
                  id="title"
                  placeholder="Enter quiz title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this quiz covers"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Questions</h2>
              <Button type="button" onClick={addQuestion} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Question
              </Button>
            </div>

            {questions.map((question, questionIndex) => (
              <Card key={questionIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Question {questionIndex + 1}</CardTitle>
                    {questions.length > 1 && (
                      <Button type="button" variant="outline" size="sm" onClick={() => removeQuestion(questionIndex)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Textarea
                      placeholder="Enter your question"
                      required
                      value={question.question}
                      onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Answer Options</Label>
                    {question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct-${questionIndex}`}
                          checked={question.correctAnswer === optionIndex}
                          onChange={() => updateQuestion(questionIndex, "correctAnswer", optionIndex)}
                          className="text-blue-600"
                        />
                        <Input
                          placeholder={`Option ${optionIndex + 1}`}
                          required
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                        />
                        <span className="text-sm text-gray-500 min-w-fit">
                          {question.correctAnswer === optionIndex ? "Correct" : ""}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          <div className="flex gap-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Quiz"}
            </Button>
            <Link href={`/instructor/courses/${params.courseId}`}>
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
