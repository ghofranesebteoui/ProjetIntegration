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
  HiX,
  HiDocumentText,
  HiClock,
  HiCog,
  HiLogout,
  HiQuestionMarkCircle,
  HiCheckCircle,
  HiAcademicCap,
} from "react-icons/hi";
import "./dashboard.css";

export default function TeacherDashboard() {
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

  const teacherData = {
    name: "Dr. Marie Martin",
    email: "marie.martin@edunova.tn",
    totalCourses: 8,
    totalStudents: 245,
    totalResources: 67,
    pendingEvaluations: 12,
  };

  const initials = teacherData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const courses = [
    { id: 1, title: "Introduction au Développement Web", students: 45, resources: 12, pendingAssignments: 8, completionRate: 68, lastUpdated: "Hier" },
    { id: 2, title: "JavaScript Avancé", students: 38, resources: 15, pendingAssignments: 4, completionRate: 72, lastUpdated: "Il y a 2 jours" },
    { id: 3, title: "React & Node.js", students: 32, resources: 10, pendingAssignments: 0, completionRate: 45, lastUpdated: "Il y a 5 jours" },
  ];

  const pendingAssignments = [
    { student: "Ahmed Ben Ali", course: "Dev Web", assignment: "TP JavaScript", submitted: "Il y a 2h" },
    { student: "Sarah Trabelsi", course: "React", assignment: "Projet Final", submitted: "Il y a 4h" },
    { student: "Mohamed Khalil", course: "JS Avancé", assignment: "Quiz 3", submitted: "Hier" },
  ];

  const studentQuestions = [
    { student: "Leila Mansour", course: "Dev Web", question: "Question sur les promesses JavaScript", time: "Il y a 1h" },
    { student: "Yassine Hadj", course: "React", question: "Problème avec les hooks", time: "Il y a 3h" },
  ];

  const recentActivity = [
    { action: "Nouveau devoir soumis", details: "TP JavaScript - Ahmed Ben Ali", time: "Il y a 2h" },
    { action: "Question posée", details: "Leila Mansour - Dev Web", time: "Il y a 3h" },
    { action: "Cours complété", details: "Sarah a terminé le module 5", time: "Hier" },
  ];

  const upcomingClasses = [
    { title: "Dev Web - Module 8", date: "Aujourd'hui, 14:00", students: 45 },
    { title: "React - TP Pratique", date: "Demain, 10:00", students: 32 },
  ];

  const teacherMenuItems = [
    { id: "home", label: "Accueil", icon: HiHome },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen },
    { id: "assignments", label: "Devoirs", icon: HiClipboardList },
    { id: "calendar", label: "Planning", icon: HiCalendar },
    { id: "questions", label: "Questions", icon: HiChatAlt2 },
    { id: "resources", label: "Ressources", icon: HiDocumentText },
  ];

  return (
    <div className="student-dashboard-wrapper">
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

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
          {teacherMenuItems.map((item) => {
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

        {/* ACTIONS RAPIDES */}
        <div className="sidebar-quick-actions">
          <div className="sidebar-section-title">Actions rapides</div>
          <button className="sidebar-nav-item">
            <HiDocumentText className="sidebar-nav-icon" />
            <span>Ajouter une ressource</span>
          </button>
          <button className="sidebar-nav-item">
            <HiClipboardList className="sidebar-nav-icon" />
            <span>Créer un quiz</span>
          </button>
          <button className="sidebar-nav-item">
            <HiChartBar className="sidebar-nav-icon" />
            <span>Voir les statistiques</span>
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
              <span className="header-notification-badge">{teacherData.pendingEvaluations}</span>
            </button>

            {/* MENU PROFIL IDENTIQUE À L'ÉTUDIANT */}
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
                      <p className="profile-dropdown-name">{teacherData.name}</p>
                      <p className="profile-dropdown-email">{teacherData.email}</p>
                    </div>
                  </div>
                  <div className="profile-dropdown-divider" />
                  <button className="profile-dropdown-item">
                    <HiUser /> Mon Profil
                  </button>
                  <div className="profile-dropdown-divider" />
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
            <h1 className="page-main-title">Tableau de bord Enseignant</h1>
            <p className="page-main-subtitle">
              Bienvenue, {teacherData.name} • Gérez vos cours et suivez vos étudiants
            </p>
          </div>

          {/* STATISTIQUES */}
          <div className="student-stats-grid">
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Cours créés</span>
                <HiFolder className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{teacherData.totalCourses}</div>
              <div className="stat-card-info">Tous actifs</div>
            </div>
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Étudiants</span>
                <HiUser className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{teacherData.totalStudents}</div>
              <div className="stat-card-info">+18 ce semestre</div>
            </div>
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Ressources</span>
                <HiDocumentText className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{teacherData.totalResources}</div>
              <div className="stat-card-info">PDF, vidéos, quiz</div>
            </div>
            <div className="student-stat-card student-highlight-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Devoirs à corriger</span>
                <HiClock className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{teacherData.pendingEvaluations}</div>
              <div className="stat-card-info">En attente</div>
            </div>
          </div>

          <div className="student-content-grid">
            <div className="student-main-col">
              {/* MES COURS */}
              <div className="student-content-card">
                <div className="content-card-header">
                  <div>
                    <h2 className="content-card-title">Mes cours</h2>
                    <p className="content-card-description">Gérez vos cours et suivez la progression</p>
                  </div>
                  <button className="student-primary-btn">Créer un cours</button>
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
                          {course.students} étudiants • {course.resources} ressources • {course.pendingAssignments} devoirs en attente
                        </p>
                        <div className="course-card-progress-bar">
                          <div className="course-progress-fill" style={{ width: `${course.completionRate}%` }} />
                        </div>
                        <div className="course-card-tags">
                          <span className="course-tag">Taux : {course.completionRate}%</span>
                          <span className="course-tag">{course.lastUpdated}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DEVOIRS À CORRIGER */}
              <div className="student-content-card">
                <h2 className="content-card-title">Devoirs à corriger</h2>
                <div className="student-activity-list">
                  {pendingAssignments.map((a, i) => (
                    <div key={i} className="student-activity-item">
                      <div className="activity-item-icon">
                        <HiDocumentText />
                      </div>
                      <div className="activity-item-details">
                        <p className="activity-item-action">{a.student}</p>
                        <p className="activity-item-course">{a.course} • {a.assignment}</p>
                        <p className="activity-item-time">
                          <HiClock className="time-icon" /> {a.submitted}
                        </p>
                      </div>
                      <button className="student-primary-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                        Corriger
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* QUESTIONS DES ÉTUDIANTS */}
              <div className="student-content-card">
                <h2 className="content-card-title">Questions des étudiants</h2>
                <div className="student-activity-list">
                  {studentQuestions.map((q, i) => (
                    <div key={i} className="student-activity-item">
                      <div className="activity-item-icon">
                        <HiQuestionMarkCircle />
                      </div>
                      <div className="activity-item-details">
                        <p className="activity-item-action">{q.student} • {q.course}</p>
                        <p className="activity-item-course">{q.question}</p>
                        <p className="activity-item-time">
                          <HiClock className="time-icon" /> {q.time}
                        </p>
                      </div>
                      <button className="student-primary-btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
                        Répondre
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR DROITE */}
            <aside className="student-sidebar">
              <div className="student-sidebar-card">
                <h3 className="sidebar-card-title">
                  <HiCalendar className="sidebar-title-icon" />
                  Prochains cours
                </h3>
                <div className="student-events-list">
                  {upcomingClasses.map((c, i) => (
                    <div key={i} className="student-event-item">
                      <div className="event-type-badge lab">
                        <HiAcademicCap />
                      </div>
                      <div className="event-item-content">
                        <p className="event-item-title">{c.title}</p>
                        <p className="event-item-date">
                          <HiClock className="event-clock-icon" /> {c.date} • {c.students} étudiants
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="student-sidebar-card">
                <h3 className="sidebar-card-title">
                  <HiBell className="sidebar-title-icon" />
                  Activité récente
                </h3>
                <div className="student-activity-list">
                  {recentActivity.map((a, i) => (
                    <div key={i} className="student-activity-item">
                      <div className="activity-item-icon">
                        {a.action.includes("devoir") ? <HiDocumentText /> : 
                         a.action.includes("Question") ? <HiQuestionMarkCircle /> : 
                         <HiCheckCircle />}
                      </div>
                      <div className="activity-item-details">
                        <p className="activity-item-action">{a.action}</p>
                        <p className="activity-item-course">{a.details}</p>
                        <p className="activity-item-time">
                          <HiClock className="time-icon" /> {a.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}