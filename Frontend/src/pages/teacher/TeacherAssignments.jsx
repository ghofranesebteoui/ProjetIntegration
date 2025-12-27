import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiPlus,
  HiAcademicCap,
  HiClipboardList,
  HiClock,
  HiCheckCircle,
  HiUsers,
  HiDocumentText,
  HiMenu,
  HiHome,
  HiBookOpen,
  HiCalendar,
  HiChatAlt2,
  HiBell,
  HiUser,
  HiX,
  HiLogout,
  HiChartBar,
} from "react-icons/hi";
import { assignmentService } from "../../services/assignmentService";
import Footer from "../../components/Footer";
import "./TeacherCourseDetail.css";
import "./TeacherAssignments.css";
import "../dashboard-base.css";

export default function TeacherAssignments() {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadAssignments();
    
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
    if (!user) return "EN";
    return `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "Enseignant";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Enseignant";
  };

  const getEmail = () => user?.email || "enseignant@edunova.tn";

  const teacherMenuItems = [
    { id: "home", label: "Accueil", icon: HiHome, path: "/enseignant/dashboard" },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen, path: "/courses" },
    { id: "assignments", label: "Quiz", icon: HiClipboardList, path: "/enseignant/assignments" },
    { id: "calendar", label: "Planning", icon: HiCalendar, path: "/enseignant/planning" },
    { id: "messaging", label: "Messagerie", icon: HiChatAlt2, path: "/enseignant/messaging" },
    { id: "statistics", label: "Statistiques", icon: HiChartBar, path: "/enseignant/statistics" },
    { id: "resources", label: "Ressources", icon: HiDocumentText, path: "/enseignant/resources" },
  ];

  const loadAssignments = async () => {
    try {
      const data = await assignmentService.getAll();
      setAssignments(data || []);
    } catch (err) {
      console.error("Erreur:", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    return 'Quiz';
  };

  const getTypeColor = (type) => {
    return 'bg-blue-100 text-blue-600';
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
          {teacherMenuItems.map((item) => {
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
                    <button className="profile-dropdown-item" onClick={() => { setProfileMenuOpen(false); navigate("/profile/teacher"); }}>
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
              <HiClipboardList /> Quiz
            </div>
            <h1 className="course-hero-title">Gestion des Quiz</h1>
            <p className="course-hero-description">
              Créez des quiz pour vos cours. Les quiz sont corrigés automatiquement et les étudiants reçoivent des badges.
            </p>
            <div className="course-hero-actions">
              <button 
                onClick={() => navigate("/enseignant/quiz/create")}
                className="btn-hero-primary"
              >
                <HiPlus /> Créer un quiz
              </button>
            </div>
          </div>
          <div className="course-hero-visual">
            <div className="hero-visual-circle">
              <HiClipboardList />
            </div>
          </div>
        </section>

        {/* Liste des devoirs */}
        <section className="course-contents-section">
          <div className="section-header">
            <h2>Mes quiz</h2>
            <span className="content-count">{assignments.length} quiz</span>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Chargement...</p>
            </div>
          ) : assignments.length === 0 ? (
            <div className="empty-contents">
              <div className="empty-icon">
                <HiClipboardList />
              </div>
              <h3>Aucun quiz créé</h3>
              <p>Commencez par créer un quiz pour vos étudiants. Chaque cours devrait avoir son quiz.</p>
              <div className="empty-actions">
                <button 
                  onClick={() => navigate("/enseignant/quiz/create")}
                  className="btn-primary"
                >
                  <HiPlus /> Créer un quiz
                </button>
              </div>
            </div>
          ) : (
            <div className="contents-grid">
              {assignments.map((assignment) => (
                <div 
                  key={assignment.id} 
                  className="content-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/enseignant/quiz/${assignment.id}`)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(assignment.type)}`}>
                      {getTypeLabel(assignment.type)}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                      Correction auto
                    </span>
                  </div>
                  
                  <h3 className="content-card-title">{assignment.title}</h3>
                  <p className="content-card-type">{assignment.course_title}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HiClock className="text-gray-400" />
                      <span>Échéance: {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('fr-FR') : 'Aucune'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HiUsers className="text-gray-400" />
                      <span>{assignment.total_submissions || 0} soumission{assignment.total_submissions > 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <HiCheckCircle className="text-green-500" />
                      <span>{assignment.graded_submissions || 0} corrigé{(assignment.graded_submissions || 0) > 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  <div className="content-card-actions mt-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); navigate(`/enseignant/quiz/${assignment.id}`); }}
                      className="action-btn action-view" 
                      title="Voir les résultats"
                    >
                      <HiDocumentText />
                    </button>
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
