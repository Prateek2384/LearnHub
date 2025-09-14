-- Insert sample instructor profile (this will be created when instructor signs up)
-- Insert sample courses
INSERT INTO public.courses (id, title, description, instructor_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript', '550e8400-e29b-41d4-a716-446655440000'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Advanced React Concepts', 'Master React hooks, context, and performance optimization', '550e8400-e29b-41d4-a716-446655440000')
ON CONFLICT (id) DO NOTHING;

-- Insert sample lectures for Web Development course
INSERT INTO public.lectures (course_id, title, content, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'HTML Fundamentals', 'Learn about HTML structure, elements, and semantic markup. HTML is the foundation of web development.', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'CSS Styling', 'Master CSS selectors, properties, and layout techniques including flexbox and grid.', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'JavaScript Basics', 'Introduction to JavaScript variables, functions, and DOM manipulation.', 3);

-- Insert sample lectures for React course
INSERT INTO public.lectures (course_id, title, content, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440002', 'React Hooks Deep Dive', 'Understanding useState, useEffect, and custom hooks.', 1),
  ('550e8400-e29b-41d4-a716-446655440002', 'Context API and State Management', 'Learn how to manage global state with React Context.', 2),
  ('550e8400-e29b-41d4-a716-446655440002', 'Performance Optimization', 'Techniques for optimizing React applications.', 3);

-- Insert sample quizzes
INSERT INTO public.quizzes (course_id, title, description) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'HTML & CSS Quiz', 'Test your knowledge of HTML and CSS fundamentals'),
  ('550e8400-e29b-41d4-a716-446655440002', 'React Hooks Quiz', 'Test your understanding of React hooks');

-- Insert sample quiz questions
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, order_index)
SELECT q.id, 'What does HTML stand for?', 
       '["HyperText Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlink and Text Markup Language"]'::jsonb, 
       0, 1
FROM public.quizzes q WHERE q.title = 'HTML & CSS Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, order_index)
SELECT q.id, 'Which CSS property is used for changing the background color?', 
       '["color", "background-color", "bgcolor", "background"]'::jsonb, 
       1, 2
FROM public.quizzes q WHERE q.title = 'HTML & CSS Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, order_index)
SELECT q.id, 'What is the correct way to declare a state variable in React?', 
       '["const [state, setState] = useState()", "const state = useState()", "useState(state)", "const setState = useState()"]'::jsonb, 
       0, 1
FROM public.quizzes q WHERE q.title = 'React Hooks Quiz';
