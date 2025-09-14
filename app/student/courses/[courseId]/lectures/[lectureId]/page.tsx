import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Play } from "lucide-react"
import Link from "next/link"
import { StudentHeader } from "@/components/student/student-header"
import { LectureCompleteButton } from "@/components/student/lecture-complete-button"
import { QuizLectureComponent } from "@/components/student/quiz-lecture-component"

export default async function LecturePage({ params }: { params: { courseId: string; lectureId: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Check enrollment
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("*")
    .eq("student_id", user.id)
    .eq("course_id", params.courseId)
    .single()

  if (!enrollment) {
    redirect("/student/browse")
  }

  // Get lecture details
  const { data: lecture } = await supabase
    .from("lectures")
    .select(`
      *,
      courses(title, instructor:profiles!courses_instructor_id_fkey(full_name))
    `)
    .eq("id", params.lectureId)
    .eq("course_id", params.courseId)
    .single()

  if (!lecture) {
    redirect(`/student/courses/${params.courseId}`)
  }

  // Check if completed
  const { data: progress } = await supabase
    .from("student_progress")
    .select("completed")
    .eq("student_id", user.id)
    .eq("lecture_id", params.lectureId)
    .single()

  const isCompleted = progress?.completed || false

  // Helper function to render video (MP4 or YouTube)
  const renderVideo = (url: string) => {
    if (!url) return null

    const isYouTube = url.includes("youtube.com") || url.includes("youtu.be")
    if (isYouTube) {
      // Handle both "watch?v=" and "youtu.be" formats
      let embedUrl = url
      if (url.includes("watch?v=")) {
        embedUrl = url.replace("watch?v=", "embed/")
      } else if (url.includes("youtu.be")) {
        const videoId = url.split("youtu.be/")[1]
        embedUrl = `https://www.youtube.com/embed/${videoId}`
      }

      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={embedUrl}
            title="Video Lecture"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )
    }

    // Default: Assume it's a direct video file (mp4/webm)
    return (
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video src={url} controls className="w-full h-full object-contain" />
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
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{lecture.title}</h1>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    lecture.type === "quiz" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {lecture.type === "quiz" ? "Quiz Lecture" : "Reading Lecture"}
                </div>
              </div>
              <p className="text-gray-600">
                {lecture.courses?.title} • {lecture.courses?.instructor?.full_name}
              </p>
            </div>
            {!isCompleted && lecture.type === "reading" && <LectureCompleteButton lectureId={params.lectureId} />}
          </div>
        </div>

        <div className="max-w-4xl">
          {lecture.type === "reading" ? (
            <>
              {/* Video Section */}
              {lecture.video_url && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Play className="h-5 w-5" />
                      Video Lecture
                    </CardTitle>
                  </CardHeader>
                  <CardContent>{renderVideo(lecture.video_url)}</CardContent>
                </Card>
              )}

              {/* Content Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Lecture Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">{lecture.content}</div>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Quiz Lecture Component */
            <QuizLectureComponent lecture={lecture} studentId={user.id} isCompleted={isCompleted} />
          )}
        </div>
      </main>
    </div>
  )
}
