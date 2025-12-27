import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiMenu,
  HiHome,
  HiBookOpen,
  HiClipboardList,
  HiCalendar,
  HiChatAlt2,
  HiBell,
  HiUser,
  HiX,
  HiLogout,
  HiAcademicCap,
  HiChartBar,
  HiDocumentText,
  HiFolder,
  HiQuestionMarkCircle,
  HiClock,
} from "react-icons/hi";
import { dashboardService } from "../../services/dashboardService";
import Footer from "../../components/Footer";
import "./TeacherDashboard.css";
import "./TeacherStatistics.css";

export default function TeacherStatistics({ handleLogout = () => {} }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("statistics");
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }

    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getStats();
        setStats(data);
      } catch (err) {
        console.error("Erreur chargement stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
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
    handleLogout();
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
    { id: "home", label: "Accueil", icon: HiHome },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen },
    { id: "assignments", label: "Quiz", icon: HiClipboardList },
    { id: "calendar", label: "Planning", icon: HiCalendar },
    { id: "messaging", label: "Messagerie", icon: HiChatAlt2 },
    { id: "statistics", label: "Statistiques", icon: HiChartBar },
    { id: "resources", label: "Ressources", icon: HiDocumentText },
  ];

  return (
    <div className={`teacher-dashboard-wrapper ${sidebarOpen ? "sidebar-active" : ""}`}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR GAUCHE */}
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
                className={`sidebar-nav-item ${activeMenu === item.id ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                  if (item.id === "home") {
                    navigate("/enseignant/dashboard");
                  } else if (item.id === "courses") {
                    navigate("/courses");
                  } else if (item.id === "assignments") {
                    navigate("/enseignant/assignments");
                  } else if (item.id === "calendar") {
                    navigate("/enseignant/planning");
                  } else if (item.id === "messaging") {
                    navigate("/enseignant/messaging");
                  } else if (item.id === "statistics") {
                    navigate("/enseignant/statistics");
                  } else if (item.id === "resources") {
                    navigate("/enseignant/resources");
                  }
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

      {/* MAIN CONTENT */}
      <main className="student-main-content">
        <div className="student-container">
          <div className="page-header">
            <h1 className="page-main-title">
              <HiChartBar className="page-title-icon" />
              Statistiques et Performance
            </h1>
            <p className="page-main-subtitle">
              Vue d'ensemble détaillée de votre activité d'enseignement
            </p>
          </div>

          {loading ? (
            <div className="stats-loading">
              <div className="loading-spinner"></div>
              <p>Chargement des statistiques...</p>
            </div>
          ) : (
            <>
              {/* STATISTIQUES PRINCIPALES */}
              <div className="student-stats-grid">
                <div className="student-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">Cours créés</span>
                    <HiFolder className="stat-card-icon" />
                  </div>
                  <div className="stat-card-value">{stats.totalCourses || 0}</div>
                  <div className="stat-card-info">Tous actifs</div>
                </div>
                <div className="student-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">Étudiants</span>
                    <HiUser className="stat-card-icon" />
                  </div>
                  <div className="stat-card-value">{stats.totalStudents || 0}</div>
                  <div className="stat-card-info">Inscrits actifs</div>
                </div>
                <div className="student-stat-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">Ressources</span>
                    <HiDocumentText className="stat-card-icon" />
                  </div>
                  <div className="stat-card-value">{stats.totalResources || 0}</div>
                  <div className="stat-card-info">PDF, vidéos, quiz</div>
                </div>
                <div className="student-stat-card student-highlight-card">
                  <div className="stat-card-header">
                    <span className="stat-card-label">Questions en attente</span>
                    <HiQuestionMarkCircle className="stat-card-icon" />
                  </div>
                  <div className="stat-card-value">{stats.pendingQuestions || 0}</div>
                  <div className="stat-card-info">À répondre</div>
                </div>
              </div>

              {/* STATISTIQUES DÉTAILLÉES */}
              <div className="detailed-stats-grid">
                <div className="stat-detail-card">
                  <div className="stat-detail-header">
                    <HiBookOpen className="stat-detail-icon" />
                    <h3>Engagement des étudiants</h3>
                  </div>
                  <div className="stat-detail-content">
                    <div className="stat-detail-item">
                      <span className="stat-detail-label">Taux de participation moyen</span>
                      <div className="stat-detail-bar">
                        <div className="stat-detail-bar-fill" style={{ width: '78%' }}></div>
                      </div>
                      <span className="stat-detail-value">78%</span>
                    </div>
                    <div className="stat-detail-item">
                      <span className="stat-detail-label">Étudiants actifs cette semaine</span>
                      <span className="stat-detail-value-large">{Math.floor((stats.totalStudents || 0) * 0.65)}</span>
                    </div>
                  </div>
                </div>

                <div className="stat-detail-card">
                  <div className="stat-detail-header">
                    <HiClipboardList className="stat-detail-icon" />
                    <h3>Activité des quiz</h3>
                  </div>
                  <div className="stat-detail-content">
                    <div className="stat-detail-item">
                      <span className="stat-detail-label">Quiz créés</span>
                      <span className="stat-detail-value-large">{stats.totalQuizzes || 12}</span>
                    </div>
                    <div className="stat-detail-item">
                      <span className="stat-detail-label">Taux de complétion</span>
                      <div className="stat-detail-bar">
                        <div className="stat-detail-bar-fill" style={{ width: '85%' }}></div>
                      </div>
                      <span className="stat-detail-value">85%</span>
                    </div>
                  </div>
                </div>

                <div className="stat-detail-card">
                  <div className="stat-detail-header">
                    <HiChatAlt2 className="stat-detail-icon" />
                    <h3>Interactions</h3>
                  </div>
                  <div className="stat-detail-content">
                    <div className="stat-detail-item">
                      <span className="stat-detail-label">Messages cette semaine</span>
                      <span className="stat-detail-value-large">{stats.weeklyMessages || 24}</span>
                    </div>
                    <div className="stat-detail-item">
                      <span className="stat-detail-label">Temps de réponse moyen</span>
                      <span className="stat-detail-value-large">2h 15min</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* STATISTIQUES PAR COURS */}
              <div className="stats-by-course-section">
                <h2 className="section-title">
                  <HiFolder className="section-title-icon" />
                  Statistiques par cours
                </h2>
                <div className="course-stats-grid">
                  <div className="course-stat-card">
                    <div className="course-stat-header">
                      <h4>Développement Web</h4>
                      <span className="course-stat-badge">{Math.floor((stats.totalStudents || 0) * 0.4)} étudiants</span>
                    </div>
                    <div className="course-stat-metrics">
                      <div className="metric-item">
                        <span className="metric-label">Taux de complétion</span>
                        <div className="metric-bar">
                          <div className="metric-bar-fill" style={{ width: '82%' }}></div>
                        </div>
                        <span className="metric-value">82%</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Note moyenne</span>
                        <span className="metric-value-large">15.5/20</span>
                      </div>
                    </div>
                  </div>

                  <div className="course-stat-card">
                    <div className="course-stat-header">
                      <h4>React Avancé</h4>
                      <span className="course-stat-badge">{Math.floor((stats.totalStudents || 0) * 0.35)} étudiants</span>
                    </div>
                    <div className="course-stat-metrics">
                      <div className="metric-item">
                        <span className="metric-label">Taux de complétion</span>
                        <div className="metric-bar">
                          <div className="metric-bar-fill" style={{ width: '75%' }}></div>
                        </div>
                        <span className="metric-value">75%</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Note moyenne</span>
                        <span className="metric-value-large">14.2/20</span>
                      </div>
                    </div>
                  </div>

                  <div className="course-stat-card">
                    <div className="course-stat-header">
                      <h4>JavaScript ES6+</h4>
                      <span className="course-stat-badge">{Math.floor((stats.totalStudents || 0) * 0.25)} étudiants</span>
                    </div>
                    <div className="course-stat-metrics">
                      <div className="metric-item">
                        <span className="metric-label">Taux de complétion</span>
                        <div className="metric-bar">
                          <div className="metric-bar-fill" style={{ width: '88%' }}></div>
                        </div>
                        <span className="metric-value">88%</span>
                      </div>
                      <div className="metric-item">
                        <span className="metric-label">Note moyenne</span>
                        <span className="metric-value-large">16.8/20</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIVITÉ RÉCENTE */}
              <div className="recent-activity-section">
                <h2 className="section-title">
                  <HiClock className="section-title-icon" />
                  Activité récente
                </h2>
                <div className="activity-timeline">
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <p className="timeline-action">Nouveau quiz créé</p>
                      <p className="timeline-details">Quiz "React Hooks" - Développement Web</p>
                      <p className="timeline-time">Il y a 2 heures</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <p className="timeline-action">15 devoirs soumis</p>
                      <p className="timeline-details">TP JavaScript - React Avancé</p>
                      <p className="timeline-time">Il y a 5 heures</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <p className="timeline-action">Nouvelle ressource ajoutée</p>
                      <p className="timeline-details">PDF "Guide ES6" - JavaScript ES6+</p>
                      <p className="timeline-time">Hier</p>
                    </div>
                  </div>
                  <div className="timeline-item">
                    <div className="timeline-dot"></div>
                    <div className="timeline-content">
                      <p className="timeline-action">Session planifiée</p>
                      <p className="timeline-details">Cours magistral - Développement Web</p>
                      <p className="timeline-time">Il y a 2 jours</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      {/* FOOTER */}
      <Footer />
      </div>
    </div>
  );
}
