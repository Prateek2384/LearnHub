"use client"

import { lazy, Suspense } from "react"
import { Card, CardContent } from "@/components/ui/card"

export const LazyQuizComponent = lazy(() => import("../student/quiz-component"))
export const LazyLectureEditor = lazy(() => import("../instructor/lecture-editor"))
export const LazyAnalyticsDashboard = lazy(() => import("../instructor/analytics-dashboard"))

export function QuizLoadingFallback() {
  return (
    <Card className="animate-pulse">
      <CardContent className="p-6">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-3 bg-gray-200 rounded w-full"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function EditorLoadingFallback() {
  return (
    <div className="space-y-4">
      <div className="h-8 bg-gray-200 rounded w-1/2 animate-pulse"></div>
      <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      <div className="h-8 bg-gray-200 rounded w-1/4 animate-pulse"></div>
    </div>
  )
}

export function LazyQuizWithSuspense(props: any) {
  return (
    <Suspense fallback={<QuizLoadingFallback />}>
      <LazyQuizComponent {...props} />
    </Suspense>
  )
}

export function LazyLectureEditorWithSuspense(props: any) {
  return (
    <Suspense fallback={<EditorLoadingFallback />}>
      <LazyLectureEditor {...props} />
    </Suspense>
  )
}
