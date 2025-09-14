"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface LectureCompleteButtonProps {
  lectureId: string
}

export function LectureCompleteButton({ lectureId }: LectureCompleteButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleComplete = async () => {
    const supabase = createClient()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      await supabase.from("student_progress").upsert({
        student_id: user.id,
        lecture_id: lectureId,
        completed: true,
        completed_at: new Date().toISOString(),
      })

      router.refresh()
    } catch (error) {
      console.error("Error marking lecture complete:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button size="sm" variant="outline" onClick={handleComplete} disabled={isLoading}>
      <CheckCircle className="h-4 w-4 mr-2" />
      {isLoading ? "Marking..." : "Mark Complete"}
    </Button>
  )
}
