-- Add lecture type column to support Reading and Quiz types
ALTER TABLE public.lectures ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'reading' CHECK (type IN ('reading', 'quiz'));

-- Add quiz-related columns to lectures table for quiz-type lectures
ALTER TABLE public.lectures ADD COLUMN IF NOT EXISTS quiz_questions JSONB;
ALTER TABLE public.lectures ADD COLUMN IF NOT EXISTS quiz_passing_score INTEGER DEFAULT 70;

-- Update existing lectures to have 'reading' type
UPDATE public.lectures SET type = 'reading' WHERE type IS NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lectures_type ON public.lectures(type);
CREATE INDEX IF NOT EXISTS idx_lectures_course_order ON public.lectures(course_id, order_index);
