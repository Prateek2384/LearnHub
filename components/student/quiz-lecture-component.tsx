"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Award, CheckCircle, XCircle } from "lucide-react"

interface QuizQuestion {
  question: string
  options: string[]
  correctAnswer: number
}

interface QuizLectureComponentProps {
  lecture: {
    id: string
    title: string
    quiz_questions: QuizQuestion[]
    quiz_passing_score: number
  }
  studentId: string
  isCompleted: boolean
}

export function QuizLectureComponent({ lecture, studentId, isCompleted }: QuizLectureComponentProps) {
  const [answers, setAnswers] = useState<number[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Initialize answers array
    setAnswers(new Array(lecture.quiz_questions.length).fill(-1))
  }, [lecture.quiz_questions.length])

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[questionIndex] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Calculate score
      let correctAnswers = 0
      lecture.quiz_questions.forEach((question, index) => {
        if (answers[index] === question.correctAnswer) {
          correctAnswers++
        }
      })

      const finalScore = Math.round((correctAnswers / lecture.quiz_questions.length) * 100)
      setScore(finalScore)
      setSubmitted(true)

      // Save quiz attempt
      await supabase.from("quiz_attempts").insert({
        student_id: studentId,
        quiz_id: lecture.id, // Using lecture ID as quiz ID for quiz-type lectures
        answers: answers,
        score: finalScore,
        total_questions: lecture.quiz_questions.length,
      })

      // Mark as completed if passing score achieved
      if (finalScore >= lecture.quiz_passing_score) {
        await supabase.from("student_progress").upsert({
          student_id: studentId,
          lecture_id: lecture.id,
          completed: true,
          completed_at: new Date().toISOString(),
        })
      }
    } catch (error) {
      console.error("Error submitting quiz:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const allAnswered = answers.every((answer) => answer !== -1)
  const passed = score !== null && score >= lecture.quiz_passing_score

  if (isCompleted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Quiz Completed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">You have already completed this quiz lecture.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          Quiz Lecture
        </CardTitle>
        <p className="text-sm text-gray-600">
          Passing Score: {lecture.quiz_passing_score}% • {lecture.quiz_questions.length} Questions
        </p>
      </CardHeader>
      <CardContent>
        {!submitted ? (
          <div className="space-y-6">
            {lecture.quiz_questions.map((question, questionIndex) => (
              <div key={questionIndex} className="space-y-3">
                <h3 className="font-medium text-lg">
                  Question {questionIndex + 1}: {question.question}
                </h3>
                <RadioGroup
                  value={answers[questionIndex]?.toString() || ""}
                  onValueChange={(value) => handleAnswerChange(questionIndex, Number.parseInt(value))}
                >
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="flex items-center space-x-2">
                      <RadioGroupItem value={optionIndex.toString()} id={`q${questionIndex}-${optionIndex}`} />
                      <Label htmlFor={`q${questionIndex}-${optionIndex}`} className="cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            ))}

            <Button onClick={handleSubmit} disabled={!allAnswered || isLoading} className="w-full">
              {isLoading ? "Submitting..." : "Submit Quiz"}
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                passed ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {passed ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
              <span className="font-medium">
                Score: {score}% ({passed ? "Passed" : "Failed"})
              </span>
            </div>

            <div className="space-y-3">
              {lecture.quiz_questions.map((question, questionIndex) => (
                <div key={questionIndex} className="text-left p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">
                    Question {questionIndex + 1}: {question.question}
                  </h4>
                  <div className="space-y-1">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-2 rounded ${
                          optionIndex === question.correctAnswer
                            ? "bg-green-100 text-green-800"
                            : optionIndex === answers[questionIndex] && optionIndex !== question.correctAnswer
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-50"
                        }`}
                      >
                        {option}
                        {optionIndex === question.correctAnswer && " ✓ (Correct)"}
                        {optionIndex === answers[questionIndex] &&
                          optionIndex !== question.correctAnswer &&
                          " ✗ (Your answer)"}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {!passed && (
              <p className="text-sm text-gray-600">
                You need {lecture.quiz_passing_score}% to pass this quiz lecture. You can retake it later.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
