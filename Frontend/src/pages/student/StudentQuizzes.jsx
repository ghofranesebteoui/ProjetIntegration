import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiAcademicCap,
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiBadgeCheck,
  HiPlay,
  HiMenu,
  HiHome,
  HiBookOpen,
  HiCalendar,
  HiChatAlt2,
  HiBell,
  HiUser,
  HiX,
  HiLogout,
} from "react-icons/hi";
import { quizService } from "../../services/quizService";
import Footer from "../../components/Footer";
import "../teacher/TeacherCourseDetail.css";
import "../dashboard-base.css";

export default function StudentQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadData();
    
    // Récupérer l'utilisateur
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setProfileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);

  const logoutAndRedirect = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getInitials = () => {
    if (!user) return "ET";
    return `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "Étudiant";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Étudiant";
  };

  const getEmail = () => user?.email || "etudiant@edunova.tn";

  const studentMenuItems = [
    { id: "home", label: "Accueil", icon: HiHome, path: "/student/dashboard" },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen, path: "/courses" },
    { id: "assignments", label: "Quiz", icon: HiClipboardList, path: "/student/quizzes" },
    { id: "calendar", label: "Calendrier", icon: HiCalendar, path: "/student/calendar" },
    { id: "messaging", label: "Messagerie", icon: HiChatAlt2, path: "/student/messaging" },
  ];

  const loadData = async () => {
    try {
      const [quizzesData, badgesData] = await Promise.all([
        quizService.getAll(),
        quizService.getBadges(),
      ]);
      setQuizzes(quizzesData || []);
      setBadges(badgesData || []);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (quiz) => {
    if (quiz.status === "completed") {
      return (
        <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
          Complété - {quiz.score}%
        </span>
      );
    }
    return (
      <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
        Disponible
      </span>
    );
  };

  return (
    <div className={`student-dashboard-wrapper ${sidebarOpen ? "sidebar-active" : ""}`}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR */}
      <aside className={`sidebar-drawer ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="edunova-icon"><HiAcademicCap /></div>
            <span className="edunova-text">eduNova</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}><HiX /></button>
        </div>

        <nav className="sidebar-nav">
          {studentMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${item.id === "assignments" ? "active" : ""}`}
                onClick={() => {
                  setSidebarOpen(false);
                  navigate(item.path);
                }}
              >
                <Icon className="sidebar-nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-nav-item logout-item" onClick={logoutAndRedirect}>
            <HiLogout className="sidebar-nav-icon" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="main-content-wrapper">
        {/* HEADER */}
        <header className="student-header">
          <div className="header-content">
            <div className="header-left">
              <button className="menu-toggle-btn" onClick={toggleSidebar}><HiMenu /></button>
              <div className="logo">
                <div className="edunova-icon"><HiAcademicCap /></div>
                <span className="edunova-text">eduNova</span>
              </div>
            </div>
            
            <div className="header-actions">
              <button className="header-icon-btn header-notification-btn">
                <HiBell />
              </button>
              
              <div className="header-user-menu">
                <div className="header-user-avatar" onClick={toggleProfileMenu}>
                  <HiUser className="avatar-icon" />
                  <span className="avatar-initials">{getInitials()}</span>
                </div>
                {profileMenuOpen && (
                  <div className="header-profile-dropdown">
                    <div className="profile-dropdown-header">
                      <div className="profile-dropdown-avatar">{getInitials()}</div>
                      <div>
                        <p className="profile-dropdown-name">{getFullName()}</p>
                        <p className="profile-dropdown-email">{getEmail()}</p>
                      </div>
                    </div>
                    <div className="profile-dropdown-divider" />
                    <button className="profile-dropdown-item" onClick={() => { setProfileMenuOpen(false); navigate("/profile/student"); }}>
                      <HiUser className="dropdown-icon" /> Mon Profil
                    </button>
                    <div className="profile-dropdown-divider" />
                    <button className="profile-dropdown-item logout-item" onClick={logoutAndRedirect}>
                      <HiLogout /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* CONTENU PRINCIPAL */}
        <main className="student-main-content">
          <div className="student-container">
    <div className="course-detail-wrapper" style={{ background: "transparent", minHeight: "auto" }}>
      <main className="course-detail-main" style={{ padding: "2rem 0" }}>
        {/* Hero Section */}
        <section className="course-hero">
          <div className="course-hero-content">
            <div className="course-hero-badge">
              <HiClipboardList /> Mes Quiz
            </div>
            <h1 className="course-hero-title">Quiz disponibles</h1>
            <p className="course-hero-description">
              Passez vos quiz et gagnez des badges. Les résultats sont automatiques !
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <HiBadgeCheck className="text-yellow-500 text-2xl" />
                <span className="text-lg font-semibold">{badges.length} badge{badges.length > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          <div className="course-hero-visual">
            <div className="hero-visual-circle">
              <HiClipboardList />
            </div>
          </div>
        </section>

        {/* Badges Section */}
        {badges.length > 0 && (
          <section className="mb-8">
            <div className="section-header">
              <h2>Mes badges</h2>
              <span className="content-count">{badges.length} badge{badges.length > 1 ? 's' : ''}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {badges.map((badge) => (
                <div key={badge.id} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center">
                  <div className={`text-4xl mb-2 ${badge.color === 'gold' ? 'text-yellow-500' : badge.color === 'silver' ? 'text-gray-400' : badge.color === 'purple' ? 'text-purple-500' : 'text-blue-500'}`}>
                    <HiBadgeCheck />
                  </div>
                  <h3 className="font-semibold text-sm">{badge.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Liste des quiz */}
        <section className="course-contents-section">
          <div className="section-header">
            <h2>Quiz</h2>
            <span className="content-count">{quizzes.length} quiz</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="empty-contents">
              <div className="empty-icon">
                <HiClipboardList />
              </div>
              <h3>Aucun quiz disponible</h3>
              <p>Vos enseignants n'ont pas encore créé de quiz.</p>
            </div>
          ) : (
            <div className="contents-grid">
              {quizzes.map((quiz) => (
                <div 
                  key={quiz.id} 
                  className="content-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/etudiant/quiz/${quiz.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    {getStatusBadge(quiz)}
                  </div>
                  
                  <h3 className="content-card-title">{quiz.title}</h3>
                  <p className="content-card-type">{quiz.course_title}</p>
                  
                  {quiz.description && (
                    <p className="text-sm text-gray-600 mt-2">{quiz.description}</p>
                  )}
                  
                  <div className="mt-4 space-y-2">
                    {quiz.due_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <HiClock className="text-gray-400" />
                        <span>Échéance: {new Date(quiz.due_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HiCheckCircle className="text-blue-500" />
                      <span>{quiz.total_points} points</span>
                    </div>
                  </div>

                  <div className="content-card-actions mt-4">
                    {quiz.status === "completed" ? (
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/etudiant/quiz/${quiz.id}`); }}
                        className="action-btn action-view w-full justify-center" 
                        title="Voir les résultats"
                      >
                        Voir les résultats
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); navigate(`/etudiant/quiz/${quiz.id}`); }}
                        className="action-btn action-view w-full justify-center bg-blue-600 text-white hover:bg-blue-700" 
                        title="Commencer le quiz"
                      >
                        <HiPlay /> Commencer
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
          </div>
        </main>
      
        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
