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
import TeacherProfile from "./pages/TeacherProfile";

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

  // Fonction de déconnexion centralisée
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    // On ne redirige plus vers "/" mais on laisse React Router gérer
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
        {/* BARRE VIOLETTE SUPPRIMÉE → propre et moderne ! */}

        <Routes>
          {/* Accueil */}
          <Route
            path="/"
            element={user ? <Navigate to={`/${user.role}`} replace /> : <LandingPage />}
          />
<Route path="/profile" element={<TeacherProfile />} />
          {/* Login */}
          <Route
            path="/login"
            element={user ? <Navigate to={`/${user.role}`} replace /> : <LoginPage setUser={setUser} />}
          />

          {/* Dashboards protégés + on passe handleLogout */}
          <Route
            path="/etudiant"
            element={
              user?.role === "etudiant" ? (
                <StudentDashboard handleLogout={handleLogout} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/enseignant"
            element={
              user?.role === "enseignant" ? (
                <TeacherDashboard handleLogout={handleLogout} />
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
<Route 
          path="/admin" 
          element={<AdminDashboard handleLogout={handleLogout} />} 
        />
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