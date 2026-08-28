import React, { useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AIChatPage } from './pages/AIChatPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { DocumentAnalysisPage } from './pages/DocumentAnalysisPage';
import { SavedNotesPage } from './pages/SavedNotesPage';
import { ProfileSettingsPage } from './pages/ProfileSettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Guard for protected routes
const ProtectedLayout = ({ children }) => {
  const { user, token, loading } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F2] flex items-center justify-center text-[#77736B] text-sm">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#C8A97E] border-t-transparent rounded-full animate-spin"></div>
          <span className="font-semibold text-[#2D2B2A]">Loading StudyLens AI...</span>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#FAF8F2] text-[#2D2B2A]">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="md:pl-64 pt-6 px-4 md:px-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  );
};

// Route wrapper for root URL '/'
const RootRoute = () => {
  const { token, loading } = useContext(AuthContext);
  if (loading) return null;
  return token ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<RootRoute />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected App Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <DashboardPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/chat"
            element={
              <ProtectedLayout>
                <AIChatPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/documents"
            element={
              <ProtectedLayout>
                <DocumentsPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/documents/:id/analysis"
            element={
              <ProtectedLayout>
                <DocumentAnalysisPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/saved-notes"
            element={
              <ProtectedLayout>
                <SavedNotesPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedLayout>
                <ProfileSettingsPage />
              </ProtectedLayout>
            }
          />

          {/* Fallback 404 Route */}
          <Route
            path="*"
            element={
              <ProtectedLayout>
                <NotFoundPage />
              </ProtectedLayout>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
