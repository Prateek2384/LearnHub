"use client"

import React, { useMemo } from "react"
import { OptimizedCourseCard } from "./optimized-course-card"

interface VirtualCourseListProps {
  courses: any[]
  type: "instructor" | "student"
  enrolledCourseIds?: string[]
  progressData?: any[]
}

export const VirtualCourseList = React.memo<VirtualCourseListProps>(
  ({ courses, type, enrolledCourseIds = [], progressData = [] }) => {
    const processedCourses = useMemo(() => {
      return courses.map((course) => {
        if (type === "student") {
          const isEnrolled = enrolledCourseIds.includes(course.id)
          const courseProgress = progressData.filter((p) => course.lectures?.some((l: any) => l.id === p.lecture_id))
          const completedLectures = courseProgress.filter((p) => p.completed).length
          const totalLectures = course.lectures?.length || 0
          const progressPercent = totalLectures > 0 ? (completedLectures / totalLectures) * 100 : 0

          return {
            ...course,
            isEnrolled,
            completedLectures,
            totalLectures,
            progressPercent,
            lectureCount: totalLectures,
            studentCount: course.enrollments?.[0]?.count || 0,
            quizCount: course.lectures?.filter((l: any) => l.type === "quiz").length || 0,
            instructorName: course.instructor?.full_name,
          }
        }

        return {
          ...course,
          lectureCount: course.lectures?.length || 0,
          studentCount: course.enrollments?.length || 0,
          quizCount: course.lectures?.filter((l: any) => l.type === "quiz").length || 0,
        }
      })
    }, [courses, type, enrolledCourseIds, progressData])

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {processedCourses.map((course) => (
          <OptimizedCourseCard
            key={course.id}
            course={course}
            type={type}
            isEnrolled={course.isEnrolled}
            progressPercent={course.progressPercent}
            completedLectures={course.completedLectures}
            totalLectures={course.totalLectures}
            instructorName={course.instructorName}
          />
        ))}
      </div>
    )
  },
)

VirtualCourseList.displayName = "VirtualCourseList"
