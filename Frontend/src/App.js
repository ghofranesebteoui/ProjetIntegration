import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Auth pages
import LandingPage from "./pages/shared/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import ForgotPassword from "./pages/auth/forgetPass";
import ResetPassword from "./pages/auth/ResetPassword";
import VerifyEmail from "./pages/auth/VerifyEmail";

// Student pages
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentProfile from "./pages/student/StudentProfile";

// Teacher pages
import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherProfile from "./pages/teacher/TeacherProfile";
import TeacherCourseDetail from "./pages/teacher/TeacherCourseDetail";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherAssignmentDetail from "./pages/teacher/TeacherAssignmentDetail";
import TeacherAssignmentCreate from "./pages/teacher/TeacherAssignmentCreate";
import CreateQuiz from "./pages/teacher/CreateQuiz";
import QuizResults from "./pages/teacher/QuizResults";
import TeacherPlanning from "./pages/teacher/TeacherPlanning";
import TeacherQuestions from "./pages/teacher/TeacherQuestions";
import TeacherResources from "./pages/teacher/TeacherResources";
import TeacherMessaging from "./pages/teacher/TeacherMessaging";
import TeacherNotifications from "./pages/teacher/TeacherNotifications";
import TeacherStatistics from "./pages/teacher/TeacherStatistics";

// Student Quiz pages
import StudentQuizzes from "./pages/student/StudentQuizzes";
import TakeQuiz from "./pages/student/TakeQuiz";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";

// Shared pages
import CoursesList from "./pages/shared/CoursesList";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erreur parsing user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-2xl font-medium text-gray-600">
        Chargement...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Page d'accueil */}
          <Route
            path="/"
            element={
              user ? <Navigate to={`/${user.role}`} replace /> : <LandingPage />
            }
          />

          {/* LOGIN */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <LoginPage setUser={setUser} />
              )
            }
          />

          {/* ==================== PROFILS (routes séparées) ==================== */}
          <Route
            path="/profile/student"
            element={
              user?.role === "etudiant" || user?.role === "étudiant" ? (
                <StudentProfile />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/profile/teacher"
            element={
              user?.role === "enseignant" || user?.role === "enseignant" ? (
                <TeacherProfile />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* ==================== DASHBOARDS ==================== */}
          <Route
            path="/etudiant"
            element={
              user?.role === "etudiant" || user?.role === "étudiant" ? (
                <StudentDashboard handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/enseignant"
            element={
              user?.role === "enseignant" || user?.role === "teacher" ? (
                <TeacherDashboard handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/enseignant/dashboard"
            element={
              user?.role === "enseignant" || user?.role === "teacher" ? (
                <TeacherDashboard handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/teacher-dashboard"
            element={
              user?.role === "enseignant" || user?.role === "teacher" ? (
                <TeacherDashboard handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/student-dashboard"
            element={
              user?.role === "etudiant" || user?.role === "student" ? (
                <StudentDashboard handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/enseignant/courses"
            element={
              user?.role === "enseignant" || user?.role === "enseignant" ? (
                <CoursesList handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="/courses" element={<CoursesList />} />

          {/* Détail d'un cours enseignant */}
          <Route
            path="/enseignant/course/:id"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherCourseDetail />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Page devoirs enseignant (maintenant quiz) */}
          <Route
            path="/enseignant/assignments"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherAssignments />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Routes Quiz Enseignant */}
          <Route
            path="/enseignant/quiz"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherAssignments />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/enseignant/quiz/create"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <CreateQuiz />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/enseignant/quiz/:id"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <QuizResults />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Routes Quiz Étudiant */}
          <Route
            path="/etudiant/quiz"
            element={
              user?.role === "etudiant" || user?.role === "étudiant" ? (
                <StudentQuizzes />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/etudiant/quiz/:id"
            element={
              user?.role === "etudiant" || user?.role === "étudiant" ? (
                <TakeQuiz />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Créer un devoir */}
          <Route
            path="/enseignant/assignments/create"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherAssignmentCreate />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Détail d'un devoir */}
          <Route
            path="/enseignant/assignments/:id"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherAssignmentDetail />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Planning enseignant */}
          <Route
            path="/enseignant/planning"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherPlanning />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Questions étudiants */}
          <Route
            path="/enseignant/questions"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherQuestions />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Ressources enseignant */}
          <Route
            path="/enseignant/resources"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherResources />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Messagerie enseignant */}
          <Route
            path="/enseignant/messaging"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherMessaging handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Notifications enseignant */}
          <Route
            path="/enseignant/notifications"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherNotifications />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Statistiques enseignant */}
          <Route
            path="/enseignant/statistics"
            element={
              user?.role === "enseignant" || user?.role === "admin" ? (
                <TeacherStatistics handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Routes publiques */}
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* 404 */}
          <Route
            path="*"
            element={<Navigate to={user ? `/${user.role}` : "/"} replace />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
