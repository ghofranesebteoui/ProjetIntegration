import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";  
import LoginPage from "./pages/LoginPage";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ForgotPassword from "./pages/forgetPass";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";

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
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh", 
        fontSize: "1.5rem" 
      }}>
        Chargement...
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        {/* Barre de navigation quand connecté */}
        {user && (
          <nav
            style={{
              padding: "1rem 2rem",
              background: "#6a1b9a",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "sticky",
              top: 0,
              zIndex: 1000,
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            }}
          >
            <h3>Bienvenue, {user.first_name || user.email}</h3>
            <button
              onClick={handleLogout}
              style={{
                background: "white",
                color: "#6a1b9a",
                border: "none",
                padding: "0.6rem 1.5rem",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Déconnexion
            </button>
          </nav>
        )}

        <Routes>
          {/* PAGE D'ACCUEIL - LandingPage */}
          <Route
            path="/"
            element={
              user ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <LandingPage />
              )
            }
          />

          {/* Login */}
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

          {/* Dashboards protégés */}
          <Route
            path="/etudiant"
            element={
              user?.role === "etudiant" ? (
                <StudentDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/enseignant"
            element={
              user?.role === "enseignant" ? (
                <TeacherDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              user?.role === "admin" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Routes publiques */}
          <Route path="/forget-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />

          {/* Toute autre route → redirige intelligemment */}
          <Route
            path="*"
            element={
              user ? (
                <Navigate to={`/${user.role}`} replace />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;