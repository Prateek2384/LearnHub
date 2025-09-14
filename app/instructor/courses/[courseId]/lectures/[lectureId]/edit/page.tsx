"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { InstructorHeader } from "@/components/instructor/instructor-header"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

export default function EditLecturePage({ params }: { params: { courseId: string; lectureId: string } }) {
  const [title, setTitle] = useState("")
  const [lectureType, setLectureType] = useState<"reading" | "quiz">("reading")
  const [content, setContent] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([
    { question: "", options: ["", "", "", ""], correctAnswer: 0 },
  ])
  const [passingScore, setPassingScore] = useState(70)
  const [orderIndex, setOrderIndex] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [courseName, setCourseName] = useState("")
  const [isLoadingData, setIsLoadingData] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchLectureData = async () => {
      const supabase = createClient()
      setIsLoadingData(true)

      try {
        const { data: lecture, error: lectureError } = await supabase
          .from("lectures")
          .select("*")
          .eq("id", params.lectureId)
          .single()

        if (lectureError) throw lectureError

        setTitle(lecture.title)
        setLectureType(lecture.type)
        setOrderIndex(lecture.order_index)

        if (lecture.type === "reading") {
          setContent(lecture.content || "")
          setVideoUrl(lecture.video_url || "")
        } else {
          setQuizQuestions(lecture.quiz_questions || [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }])
          setPassingScore(lecture.quiz_passing_score || 70)
        }

        const { data: course } = await supabase.from("courses").select("title").eq("id", params.courseId).single()
        if (course) {
          setCourseName(course.title)
        }
      } catch (error) {
        console.error("Error fetching lecture:", error)
        setError("Failed to load lecture data")
      } finally {
        setIsLoadingData(false)
      }
    }

    fetchLectureData()
  }, [params.courseId, params.lectureId])

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }])
  }

  const removeQuestion = (index: number) => {
    if (quizQuestions.length > 1) {
      setQuizQuestions(quizQuestions.filter((_, i) => i !== index))
    }
  }

  const updateQuestion = (index: number, field: keyof QuizQuestion, value: any) => {
    const updated = [...quizQuestions]
    updated[index] = { ...updated[index], [field]: value }
    setQuizQuestions(updated)
  }

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...quizQuestions]
    updated[questionIndex].options[optionIndex] = value
    setQuizQuestions(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const lectureData: any = {
        title,
        type: lectureType,
        order_index: orderIndex,
      }

      if (lectureType === "reading") {
        lectureData.content = content
        lectureData.video_url = videoUrl || null
        lectureData.quiz_questions = null
        lectureData.quiz_passing_score = null
      } else {
        lectureData.quiz_questions = quizQuestions
        lectureData.quiz_passing_score = passingScore
        lectureData.content = `Quiz: ${title}`
        lectureData.video_url = null
      }

      const { error } = await supabase.from("lectures").update(lectureData).eq("id", params.lectureId)

      if (error) throw error

      router.push(`/instructor/courses/${params.courseId}`)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <InstructorHeader />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading lecture data...</div>
        </main>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900">Edit Lecture</h1>
          <p className="text-gray-600 mt-2">Update lecture in "{courseName}"</p>
        </div>

        <div className="max-w-4xl">
          <Card>
            <CardHeader>
              <CardTitle>Lecture Details</CardTitle>
              <CardDescription>Update the lecture type and content</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Lecture Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter lecture title"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Lecture Type</Label>
                  <RadioGroup value={lectureType} onValueChange={(value: "reading" | "quiz") => setLectureType(value)}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="reading" id="reading" />
                      <Label htmlFor="reading">Reading Lecture</Label>
                      <span className="text-sm text-gray-500">- Text content with optional video</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quiz" id="quiz" />
                      <Label htmlFor="quiz">Quiz Lecture</Label>
                      <span className="text-sm text-gray-500">- Multiple choice questions</span>
                    </div>
                  </RadioGroup>
                </div>

                {lectureType === "reading" ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="content">Lecture Content</Label>
                      <Textarea
                        id="content"
                        placeholder="Write the main content of your lecture"
                        required
                        rows={8}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="videoUrl">Video URL (Optional)</Label>
                      <Input
                        id="videoUrl"
                        type="url"
                        placeholder="https://youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="passingScore">Passing Score (%)</Label>
                      <Input
                        id="passingScore"
                        type="number"
                        min="1"
                        max="100"
                        value={passingScore}
                        onChange={(e) => setPassingScore(Number.parseInt(e.target.value))}
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Quiz Questions</Label>
                        <Button type="button" onClick={addQuestion} size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Add Question
                        </Button>
                      </div>

                      {quizQuestions.map((question, questionIndex) => (
                        <Card key={questionIndex} className="p-4">
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <Label>Question {questionIndex + 1}</Label>
                              {quizQuestions.length > 1 && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeQuestion(questionIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>

                            <Textarea
                              placeholder="Enter your question"
                              value={question.question}
                              onChange={(e) => updateQuestion(questionIndex, "question", e.target.value)}
                              required
                            />

                            <div className="space-y-2">
                              <Label>Answer Options</Label>
                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    name={`correct-${questionIndex}`}
                                    checked={question.correctAnswer === optionIndex}
                                    onChange={() => updateQuestion(questionIndex, "correctAnswer", optionIndex)}
                                  />
                                  <Input
                                    placeholder={`Option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                                    required
                                  />
                                  <span className="text-sm text-gray-500">
                                    {question.correctAnswer === optionIndex ? "(Correct)" : ""}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <Label htmlFor="orderIndex">Order Index</Label>
                  <Input
                    id="orderIndex"
                    type="number"
                    min="1"
                    required
                    value={orderIndex}
                    onChange={(e) => setOrderIndex(Number.parseInt(e.target.value))}
                  />
                </div>

                {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Updating..." : `Update ${lectureType === "reading" ? "Reading" : "Quiz"} Lecture`}
                  </Button>
                  <Link href={`/instructor/courses/${params.courseId}`}>
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
