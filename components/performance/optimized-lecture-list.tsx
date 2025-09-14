"use client"

import React, { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, CheckCircle, Circle } from "lucide-react"
import Link from "next/link"

interface LectureListProps {
  lectures: any[]
  courseId: string
  progressMap: Map<string, boolean>
  type?: "student" | "instructor"
}

export const OptimizedLectureList = React.memo<LectureListProps>(
  ({ lectures, courseId, progressMap, type = "student" }) => {
    const sortedLectures = useMemo(() => {
      return lectures.sort((a, b) => a.order_index - b.order_index)
    }, [lectures])

    const completionStats = useMemo(() => {
      const completedCount = sortedLectures.filter((lecture) => progressMap.get(lecture.id)).length
      const progressPercent = sortedLectures.length > 0 ? (completedCount / sortedLectures.length) * 100 : 0
      return { completedCount, progressPercent }
    }, [sortedLectures, progressMap])

    if (sortedLectures.length === 0) {
      return (
        <Card className="text-center py-12">
          <CardContent>
            <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No lectures available</h3>
            <p className="text-gray-600">
              {type === "instructor"
                ? "Add your first lecture to get started"
                : "The instructor hasn't added any lectures yet"}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div>
        {type === "student" && (
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
            <Badge variant="secondary">
              {completionStats.completedCount}/{sortedLectures.length} completed
            </Badge>
          </div>
        )}

        <div className="space-y-4">
          {sortedLectures.map((lecture, index) => {
            const isCompleted = progressMap.get(lecture.id)
            const isNext =
              type === "student" && !isCompleted && sortedLectures.slice(0, index).every((l) => progressMap.get(l.id))

            return (
              <Card key={lecture.id} className={`${isNext ? "ring-2 ring-blue-500" : ""}`}>
                <CardHeader>
                  <div className="flex items-start gap-4">
                    {type === "student" && (
                      <div className="flex-shrink-0 mt-1">
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-green-600" />
                        ) : (
                          <Circle className="h-6 w-6 text-gray-400" />
                        )}
                      </div>
                    )}
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        {lecture.title}
                        {isNext && <Badge>Next</Badge>}
                        {type === "instructor" && (
                          <Badge variant={lecture.type === "quiz" ? "secondary" : "outline"}>
                            {lecture.type === "quiz" ? "Quiz" : "Reading"}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 mt-1">
                        {lecture.content?.substring(0, 150)}...
                      </CardDescription>
                      {type === "instructor" && (
                        <p className="text-sm text-gray-600 mt-1">Order: {lecture.order_index}</p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {type === "student" ? (
                      <Link href={`/student/courses/${courseId}/lectures/${lecture.id}`}>
                        <Button size="sm" variant={isCompleted ? "outline" : "default"}>
                          <Play className="h-4 w-4 mr-2" />
                          {isCompleted ? "Review" : "Start"}
                        </Button>
                      </Link>
                    ) : (
                      <Link href={`/instructor/courses/${courseId}/lectures/${lecture.id}/edit`}>
                        <Button size="sm" variant="outline">
                          Edit
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    )
  },
)

OptimizedLectureList.displayName = "OptimizedLectureList"
