import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Landing, Login, Signup, Onboarding, Dashboard, Lesson, Profile } from '@/pages'
import { AuthGuard, OnboardingGuard } from '@/modules/auth'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />

        {/* Auth required, onboarding not required */}
        <Route path="/onboarding" element={<AuthGuard><Onboarding /></AuthGuard>} />
        <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />

        {/* Auth + onboarding required */}
        <Route path="/learn" element={<AuthGuard><OnboardingGuard><Dashboard /></OnboardingGuard></AuthGuard>} />
        <Route path="/learn/:slug" element={<AuthGuard><OnboardingGuard><Lesson /></OnboardingGuard></AuthGuard>} />
      </Routes>
    </BrowserRouter>
  )
}
