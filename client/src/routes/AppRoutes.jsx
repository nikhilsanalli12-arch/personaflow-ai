import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Layout
import MainLayout from '../layouts/MainLayout';

// Public pages
import LandingPage from '../pages/LandingPage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import AboutPage from '../pages/AboutPage';
import PrivacyPage from '../pages/PrivacyPage';

// Authenticated pages
import DashboardPage from '../pages/DashboardPage';
import OnboardingPage from '../pages/OnboardingPage';
import PersonaPage from '../pages/PersonaPage';
import PersonaTimelinePage from '../pages/PersonaTimelinePage';
import PersonaChangesPage from '../pages/PersonaChangesPage';
import RecommendationsPage from '../pages/RecommendationsPage';
import AssistantPage from '../pages/AssistantPage';
import LearningPathPage from '../pages/LearningPathPage';
import ContentListPage from '../pages/ContentListPage';
import ContentDetailPage from '../pages/ContentDetailPage';
import GoalsPage from '../pages/GoalsPage';
import QuizPage from '../pages/QuizPage';
import PersonalizationComparisonPage from '../pages/PersonalizationComparisonPage';
import SettingsPage from '../pages/SettingsPage';
import AdminDashboardPage from '../pages/AdminDashboardPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Authenticating...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  if (isLoading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">Checking permissions...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />

      {/* Authenticated Routes wrapped in MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="persona" element={<PersonaPage />} />
        <Route path="persona/timeline" element={<PersonaTimelinePage />} />
        <Route path="persona/changes" element={<PersonaChangesPage />} />
        <Route path="recommendations" element={<RecommendationsPage />} />
        <Route path="assistant" element={<AssistantPage />} />
        <Route path="learning" element={<LearningPathPage />} />
        <Route path="learning/path" element={<LearningPathPage />} />
        <Route path="content" element={<ContentListPage />} />
        <Route path="content/:id" element={<ContentDetailPage />} />
        <Route path="goals" element={<GoalsPage />} />
        <Route path="quiz" element={<QuizPage />} />
        <Route path="context" element={<DashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="profile" element={<SettingsPage />} />
        <Route path="personalization" element={<PersonalizationComparisonPage />} />

        {/* Admin Routes */}
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/users"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/content"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="admin/analytics"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
