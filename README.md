# Online Learning Platform

A comprehensive full-stack online learning platform built with Next.js, featuring role-based authentication, course management, interactive quizzes, and progress tracking.

## 🚀 Features

### For Students
- **Course Enrollment & Learning**: Browse and enroll in courses with structured lessons
- **Interactive Quizzes**: Take quizzes with multiple question types and instant feedback
- **Progress Tracking**: Monitor learning progress with detailed analytics and achievements
- **Learning Dashboard**: Personalized dashboard with course recommendations and statistics
- **Achievement System**: Earn badges and maintain learning streaks

### For Instructors
- **Course Creation**: Build comprehensive courses with lessons and multimedia content
- **Quiz Builder**: Create interactive quizzes with various question types
- **Student Analytics**: Track student progress and performance across courses
- **Content Management**: Organize and manage course materials efficiently
- **Dashboard Overview**: Monitor course statistics and student engagement

### Platform Features
- **Role-Based Authentication**: Secure login system with student and instructor roles
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-Time Progress**: Live updates on learning progress and achievements
- **Search & Filtering**: Advanced course discovery and filtering options
- **Professional UI**: Clean, modern interface with accessibility features

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **State Management**: React Context API
- **Authentication**: Custom role-based auth system
- **Data Storage**: Local state management (ready for database integration)
- **Icons**: Lucide React
- **Charts**: Recharts for analytics visualization

## 📦 Installation

1. **Clone the repository**
   ```
   git clone <repository-url>
   cd online-learning-platform
   ```

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Run the development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Quick Start

### Demo Accounts

The platform comes with pre-configured demo accounts for testing:

**Student Account:**
- Email: `student@demo.com`
- Password: `password`

**Instructor Account:**
- Email: `instructor@demo.com`
- Password: `password`

### Getting Started as a Student

1. Log in with the student demo account
2. Browse available courses on the dashboard
3. Enroll in a course by clicking "Enroll Now"
4. Start learning by accessing lessons
5. Take quizzes to test your knowledge
6. Track your progress in the Progress section

### Getting Started as an Instructor

1. Log in with the instructor demo account
2. View your instructor dashboard with course statistics
3. Create a new course using the "Create Course" button
4. Add lessons and content to your course
5. Create quizzes using the Quiz Builder
6. Monitor student progress and engagement

## 📁 Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── auth/              # Authentication pages
│   ├── instructor/        # Instructor dashboard and tools
│   ├── student/           # Student learning interface
│   └── layout.tsx         # Root layout with auth context
├── components/            # Reusable React components
│   ├── auth/             # Authentication components
│   ├── instructor/       # Instructor-specific components
│   ├── student/          # Student-specific components
│   ├── quiz/             # Quiz system components
│   ├── progress/         # Progress tracking components
│   ├── layout/           # Navigation and layout components
│   └── ui/               # shadcn/ui components
├── contexts/             # React context providers
├── lib/                  # Utility functions and data
├── hooks/                # Custom React hooks
└── public/               # Static assets
\`\`\`

