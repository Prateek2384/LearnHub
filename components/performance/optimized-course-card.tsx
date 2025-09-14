"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Users, Award } from "lucide-react"
import Link from "next/link"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    lectureCount: number
    studentCount: number
    quizCount: number
  }
  type: "instructor" | "student"
  isEnrolled?: boolean
  progressPercent?: number
  completedLectures?: number
  totalLectures?: number
  instructorName?: string
}

export const OptimizedCourseCard = React.memo<CourseCardProps>(
  ({ course, type, isEnrolled, progressPercent, completedLectures, totalLectures, instructorName }) => {
    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-3">{course.description}</CardDescription>
          {instructorName && <p className="text-sm text-gray-600">Instructor: {instructorName}</p>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.lectureCount} lectures</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{course.studentCount} students</span>
            </div>
            {course.quizCount > 0 && (
              <div className="flex items-center gap-1">
                <Award className="h-4 w-4" />
                <span>{course.quizCount} quizzes</span>
              </div>
            )}
          </div>

          {type === "student" && progressPercent !== undefined && (
            <div className="mb-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Progress</span>
                <span>
                  {completedLectures}/{totalLectures} lectures
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {type === "instructor" ? (
              <>
                <Link href={`/instructor/courses/${course.id}`} className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Manage
                  </Button>
                </Link>
                <Link href={`/instructor/courses/${course.id}/lectures/create`} className="flex-1">
                  <Button className="w-full">Add Lecture</Button>
                </Link>
              </>
            ) : isEnrolled ? (
              <Link href={`/student/courses/${course.id}`} className="flex-1">
                <Button className="w-full">Continue Learning</Button>
              </Link>
            ) : (
              <Button className="w-full">Enroll Now</Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  },
)

OptimizedCourseCard.displayName = "OptimizedCourseCard"
