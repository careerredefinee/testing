import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ChatAssistant from './components/ChatAssistant';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './HomePage';
import ServicesPage from './ServicesPage';
import CoursesPage from './CoursesPage';
import ToolsPage from './ToolsPage';
import SupportPage from './SupportPage';
import JobsPage from './JobsPage';
import ReviewsPage from './ReviewsPage';
import AboutPage from './AboutPage';
import KnowledgeHubPage from './pages/KnowledgeHubPage';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import QueriesPage from './pages/QueriesPage';
import DashboardPage from './pages/admin/DashboardPage';
import UsersPage from './pages/admin/UsersPage';
import AdminJobsPage from './pages/admin/JobsPage';
import PremiumUsersPage from './pages/admin/PremiumUsersPage';
import MaterialsPage from './pages/admin/MaterialsPage';
import AdminMeetingsPage from './pages/admin/MeetingsPage';
import AdminPMeetingsPage from './pages/admin/PMeetingsPage';
import CallsPage from './pages/admin/CallsPage';
import ProtectedRoute from './components/ProtectedRoute';
import PremiumPage from './pages/PremiumPage';
import AdminGroupsPage from './pages/admin/GroupsPage';
import GroupChatPage from './pages/GroupChatPage';
import GroupsListPage from './pages/GroupsListPage';
import PremiumToolsPage from './pages/PremiumToolsPage';
import AssessmentsPage from './pages/admin/AssessmentsPage';

// Admin Layout component
const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/tools" element={<ToolsPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/jobs" element={<JobsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/premium"
                element={
                  <ProtectedRoute requiredPremium redirectTo="/login">
                    <PremiumPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/premium-tools"
                element={
                  <ProtectedRoute requiredPremium redirectTo="/login">
                    <PremiumToolsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePasswordPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Protected Routes */}
              <Route
                path="/my-queries"
                element={
                  <ProtectedRoute>
                    <QueriesPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route element={
                <ProtectedRoute requiredRole="admin" redirectTo="/login" />
              }>
                <Route element={<AdminLayout />}>
                  <Route path="/admin" element={<DashboardPage />} />
                  <Route path="/admin/users" element={<UsersPage />} />
                  <Route path="/admin/jobs" element={<AdminJobsPage />} />
                  <Route path="/admin/materials" element={<MaterialsPage />} />
                  <Route path="/admin/assessments" element={<AssessmentsPage />} />
                  <Route path="/admin/groups" element={<AdminGroupsPage />} />
                  <Route path="/admin/premium-users" element={<PremiumUsersPage />} />
                  <Route path="/admin/meetings" element={<AdminMeetingsPage />} />
                  <Route path="/admin/pmeetings" element={<AdminPMeetingsPage />} />
                  <Route path="/admin/calls" element={<CallsPage />} />
                </Route>
              </Route>
              {/* Groups List (Premium) */}
              <Route
                path="/groups"
                element={
                  <ProtectedRoute requiredPremium redirectTo="/login">
                    <GroupsListPage />
                  </ProtectedRoute>
                }
              />
              {/* Group Chat */}
              <Route
                path="/groups/:id"
                element={
                  <ProtectedRoute requiredPremium redirectTo="/login">
                    <GroupChatPage />
                  </ProtectedRoute>
                }
              />
              
              {/* Add more protected routes here */}
            </Routes>
          </main>
          <Footer />
          <ChatAssistant />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;