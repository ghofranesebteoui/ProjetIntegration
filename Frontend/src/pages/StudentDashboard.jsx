import { useState, useEffect } from "react";
import {
  HiMenu,
  HiHome,
  HiBookOpen,
  HiClipboardList,
  HiCalendar,
  HiChatAlt2,
  HiSearch,
  HiBell,
  HiUser,
  HiFolder,
  HiChartBar,
  HiEye,
  HiStar,
  HiMail,
  HiLogout,
  HiCog,
  HiX,
  HiDocumentText,
  HiClock,
} from "react-icons/hi";
import "./dashboard.css";

export default function StudentDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);

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

  const studentData = {
    name: "Jean Dupont",
    email: "jean.dupont@edunova.tn",
    enrolledCourses: 12,
    progressPercentage: 78,
    resourcesViewed: 32,
    averageGrade: 15.8,
  };

  const initials = studentData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const courses = [
    { id: 1, title: "Introduction au Développement Web", progress: 82, modules: "10/12", category: "Informatique", level: "Débutant", instructor: "Dr. Martin" },
    { id: 2, title: "JavaScript Avancé", progress: 65, modules: "8/15", category: "Programmation", level: "Intermédiaire", instructor: "Prof. Dubois" },
    { id: 3, title: "Intelligence Artificielle", progress: 41, modules: "5/12", category: "IA", level: "Avancé", instructor: "Dr. Laurent" },
    { id: 4, title: "Design UI/UX", progress: 90, modules: "11/12", category: "Design", level: "Débutant", instructor: "Prof. Sarah" },
  ];

  const UPCOMING_EVENTS = [
    { title: "Examen de JavaScript", date: "Demain, 14:00", type: "exam" },
    { title: "Rendu du projet React", date: "Dans 3 jours", type: "assignment" },
    { title: "TP Intelligence Artificielle", date: "Vendredi, 10:00", type: "lab" },
  ];

  const recentMessages = [
    { name: "Prof. Marie Martin", message: "N'oubliez pas le TP pour vendredi !", time: "2h", avatar: "MM" },
    { name: "Prof. Ahmed Ben Ali", message: "Correction du quiz disponible", time: "5h", avatar: "AB" },
    { name: "Administration", message: "Inscription aux examens ouverte", time: "1j", avatar: "AD" },
  ];

  const recentActivities = [
    { action: "Nouveau document ajouté", course: "Développement Web", time: "Il y a 2h" },
    { action: "Note mise à jour", course: "JavaScript Avancé", time: "Il y a 4h" },
    { action: "Nouveau quiz disponible", course: "Intelligence Artificielle", time: "Hier" },
  ];

  const menuItems = [
    { id: "home", label: "Accueil", icon: HiHome },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen },
    { id: "grades", label: "Notes", icon: HiClipboardList },
    { id: "calendar", label: "Calendrier", icon: HiCalendar },
    { id: "messages", label: "Messagerie", icon: HiChatAlt2 },
    { id: "resources", label: "Ressources", icon: HiDocumentText },
  ];

  return (
    <div className="student-dashboard-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* SIDEBAR GAUCHE */}
      <aside className={`sidebar-drawer ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <HiBookOpen className="sidebar-logo-icon" />
            <span className="sidebar-logo-text">eduNova</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <HiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${activeMenu === item.id ? "active" : ""}`}
                onClick={() => {
                  setActiveMenu(item.id);
                  setSidebarOpen(false);
                }}
              >
                <Icon className="sidebar-nav-icon" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ACTIONS RAPIDES DANS LE SIDEBAR */}
        <div className="sidebar-quick-actions">
          <div className="sidebar-section-title">Actions rapides</div>
          <button className="sidebar-nav-item">
            <HiChatAlt2 className="sidebar-nav-icon" />
            <span>Poser une question</span>
          </button>
          <button className="sidebar-nav-item">
            <HiDocumentText className="sidebar-nav-icon" />
            <span>Mes téléchargements</span>
          </button>
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-nav-item logout-item">
            <HiLogout className="sidebar-nav-icon" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* HEADER */}
      <header className="student-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-toggle-btn" onClick={toggleSidebar}>
              <HiMenu />
            </button>
            <div className="header-logo">
              <div className="header-logo-icon">
                <HiBookOpen />
              </div>
              <span className="header-logo-text">eduNova</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-icon-btn">
              <HiSearch />
            </button>
            <button className="header-icon-btn header-notification-btn">
              <HiBell />
              <span className="header-notification-badge">3</span>
            </button>

            <div className="header-user-menu">
              <div className="header-user-avatar" onClick={toggleProfileMenu}>
                <HiUser className="avatar-icon" />
                <span className="avatar-initials">{initials}</span>
              </div>

              {profileMenuOpen && (
                <div className="header-profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar">{initials}</div>
                    <div>
                      <p className="profile-dropdown-name">{studentData.name}</p>
                      <p className="profile-dropdown-email">{studentData.email}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider"></div>
                  <button className="profile-dropdown-item">
                    <HiUser /> Mon Profil
                  </button>
                  <div className="profile-dropdown-divider"></div>
                  <button className="profile-dropdown-item logout-item">
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
            <h1 className="page-main-title">Tableau de bord Étudiant</h1>
            <p className="page-main-subtitle">Bienvenue, {studentData.name} ! Continuez votre progression</p>
          </div>

          {/* STATISTICS */}
          <div className="student-stats-grid">
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Cours inscrits</span>
                <HiFolder className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{studentData.enrolledCourses}</div>
              <div className="stat-card-info">+2 ce semestre</div>
            </div>
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Progression globale</span>
                <HiChartBar className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{studentData.progressPercentage}%</div>
              <div className="stat-card-info">Excellent travail !</div>
            </div>
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Ressources vues</span>
                <HiEye className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{studentData.resourcesViewed}</div>
              <div className="stat-card-info">Sur 120 disponibles</div>
            </div>
            <div className="student-stat-card student-highlight-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Moyenne générale</span>
                <HiStar className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{studentData.averageGrade}/20</div>
              <div className="stat-card-info">En progression</div>
            </div>
          </div>

          <div className="student-content-grid">
            {/* COLONNE PRINCIPALE */}
            <div className="student-main-col">
              {/* Cours actifs */}
              <div className="student-content-card">
                <div className="content-card-header">
                  <div>
                    <h2 className="content-card-title">Mes cours actifs</h2>
                    <p className="content-card-description">Continuez votre apprentissage</p>
                  </div>
                  <button className="student-primary-btn">
                    <HiBookOpen /> Explorer plus
                  </button>
                </div>

                <div className="student-courses-list">
                  {courses.map((course) => (
                    <div key={course.id} className="student-course-card">
                      <div className="course-card-icon">
                        <HiFolder />
                      </div>
                      <div className="course-card-details">
                        <h3 className="course-card-title">{course.title}</h3>
                        <p className="course-card-meta">
                          Par {course.instructor} • {course.modules} modules
                        </p>
                        <div className="course-card-progress-bar">
                          <div className="course-progress-fill" style={{ width: `${course.progress}%` }}></div>
                        </div>
                        <div className="course-card-tags">
                          <span className="course-tag">{course.category}</span>
                          <span className="course-tag">{course.level}</span>
                          <span className="course-tag progress-tag">{course.progress}% complété</span>
                        </div>
                      </div>
                      <div className="course-card-progress-circle">
                        <svg width="60" height="60">
                          <circle cx="30" cy="30" r="26" fill="none" stroke="#e0e0e0" strokeWidth="4" />
                          <circle
                            cx="30"
                            cy="30"
                            r="26"
                            fill="none"
                            stroke="#9c27b0"
                            strokeWidth="4"
                            strokeDasharray={`${course.progress * 1.63} 163`}
                            strokeLinecap="round"
                            transform="rotate(-90 30 30)"
                          />
                        </svg>
                        <span className="progress-circle-text">{course.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activité récente */}
              <div className="student-content-card">
                <h2 className="content-card-title">Activité récente</h2>
                <p className="content-card-description">Vos dernières actions</p>
                <div className="student-activity-list">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="student-activity-item">
                      <div className="activity-item-icon">
                        <HiDocumentText />
                      </div>
                      <div className="activity-item-details">
                        <p className="activity-item-action">{activity.action}</p>
                        <p className="activity-item-course">{activity.course}</p>
                        <p className="activity-item-time">
                          <HiClock className="time-icon" /> {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR DROITE (sans Actions rapides) */}
            <div className="student-sidebar">
              <div className="student-sidebar-card">
                <h3 className="sidebar-card-title">
                  <HiCalendar className="sidebar-title-icon" />
                  Prochains événements
                </h3>
                <div className="student-events-list">
                  {UPCOMING_EVENTS.map((event, i) => (
                    <div key={i} className="student-event-item">
                      <div className={`event-type-badge ${event.type}`}>
                        {event.type === "exam" ? "Examen" : event.type === "assignment" ? "Rendu" : "TP"}
                      </div>
                      <div className="event-item-content">
                        <p className="event-item-title">{event.title}</p>
                        <p className="event-item-date">
                          <HiClock className="event-clock-icon" /> {event.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="student-sidebar-card">
                <h3 className="sidebar-card-title">
                  <HiMail className="sidebar-title-icon" />
                  Messages récents
                </h3>
                <div className="student-messages-list">
                  {recentMessages.map((msg, i) => (
                    <div key={i} className="student-message-item">
                      <div className="message-item-avatar">{msg.avatar}</div>
                      <div className="message-item-content">
                        <p className="message-item-name">{msg.name}</p>
                        <p className="message-item-text">{msg.message}</p>
                        <p className="message-item-time">{msg.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}