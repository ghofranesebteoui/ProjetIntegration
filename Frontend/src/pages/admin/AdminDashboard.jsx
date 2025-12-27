import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiMenu,
  HiHome,
  HiUserGroup,
  HiBookOpen,
  HiClipboardCheck,
  HiChartBar,
  HiUserAdd,
  HiBan,
  HiSearch,
  HiBell,
  HiUser,
  HiCog,
  HiLogout,
  HiX,
  HiAcademicCap,
  HiTrendingUp,
  HiClock,
  HiCheckCircle,
  HiExclamationCircle,
} from "react-icons/hi";
import Footer from "../../components/Footer";
import "./AdminDashboard.css";

export default function AdminDashboard({ handleLogout = () => {} }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");
  const [user, setUser] = useState(null);

  const logoutAndRedirect = () => {
    handleLogout();
    navigate("/login");
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleProfileMenu = () => setProfileMenuOpen(!profileMenuOpen);

  // Fermer le menu profil en cliquant ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      const profileMenu = document.querySelector(".header-user-menu");
      if (profileMenu && !profileMenu.contains(event.target)) {
        setProfileMenuOpen(false);
      }
    };
    if (profileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [profileMenuOpen]);

  // Charger l'utilisateur depuis localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Erreur parsing utilisateur:", error);
      }
    }
  }, []);

  // Touche Escape
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

  // Données fictives admin
  const adminStats = {
    totalUsers: 1247,
    totalTeachers: 48,
    totalStudents: 1199,
    totalCourses: 87,
    pendingRegistrations: 14,
    revenueThisMonth: "42 850 DT",
  };

  const getInitials = () => {
    if (!user) return "AD";
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "Administrateur Système";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Administrateur";
  };

  const getEmail = () => {
    if (!user) return "admin@edunova.tn";
    return user.email || "admin@edunova.tn";
  };

  // Demandes d'inscription en attente
  const pendingRegistrations = [
    { id: 1, name: "Karim Ben Salah", role: "Enseignant", date: "Aujourd'hui", email: "karim.bs@exemple.com" },
    { id: 2, name: "Amina Trabelsi", role: "Étudiant", date: "Hier", email: "amina.tr@exemple.com" },
    { id: 3, name: "Sofien Ayari", role: "Enseignant", date: "Il y a 2 jours", email: "sofien.ayari@exemple.com" },
  ];

  // Activité récente du système
  const recentActivity = [
    { action: "Nouvel enseignant inscrit", details: "Dr. Nadia Khemiri", time: "Il y a 30 min", type: "success" },
    { action: "Cours publié", details: "Machine Learning Avancé – Prof. Riadh", time: "Il y a 2h", type: "info" },
    { action: "Utilisateur banni", details: "Compte spam détecté", time: "Il y a 5h", type: "warning" },
    { action: "Paiement reçu", details: "Abonnement Premium – Leila M.", time: "Hier", type: "success" },
  ];

  // Menu spécifique Admin
  const adminMenuItems = [
    { id: "home", label: "Accueil", icon: HiHome },
    { id: "users", label: "Utilisateurs", icon: HiUserGroup },
    { id: "teachers", label: "Enseignants", icon: HiAcademicCap },
    { id: "courses", label: "Cours", icon: HiBookOpen },
    { id: "registrations", label: "Inscriptions", icon: HiClipboardCheck },
    { id: "statistics", label: "Statistiques", icon: HiChartBar },
    { id: "settings", label: "Paramètres", icon: HiCog },
  ];

  return (
    <div className={`admin-dashboard-wrapper ${sidebarOpen ? "sidebar-active" : ""}`}>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* SIDEBAR GAUCHE */}
      <aside className={`sidebar-drawer ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="edunova-icon">
              <HiAcademicCap />
            </div>
            <span className="edunova-txt">eduNova</span>
          </div>
          <button className="sidebar-close-btn" onClick={toggleSidebar}>
            <HiX />
          </button>
        </div>

        <nav className="sidebar-nav">
          {adminMenuItems.map((item) => {
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
            <button className="menu-toggle-btn" onClick={toggleSidebar}>
              <HiMenu />
            </button>
            <div className="logo">
              <div className="edunova-icon">
                <HiAcademicCap />
              </div>
              <span className="edunova-txt">eduNova</span>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-icon-btn">
              <HiSearch />
            </button>
            <button className="header-icon-btn header-notification-btn">
              <HiBell />
              <span className="header-notification-badge">{adminStats.pendingRegistrations}</span>
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
                  <button className="profile-dropdown-item">
                    <HiCog /> Paramètres
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
            <h1 className="page-main-title">Tableau de bord Administrateur</h1>
            <p className="page-main-subtitle">
              Bienvenue, <span style={{ fontWeight: "bold" }}>{getFullName()}</span> ! Gérez votre plateforme eduNova
            </p>
          </div>

          {/* STATISTIQUES GLOBALES */}
          <div className="student-stats-grid">
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Utilisateurs totaux</span>
                <HiUserGroup className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{adminStats.totalUsers}</div>
              <div className="stat-card-info">+127 ce mois</div>
            </div>
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Enseignants</span>
                <HiAcademicCap className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{adminStats.totalTeachers}</div>
              <div className="stat-card-info">Actifs</div>
            </div>
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Étudiants</span>
                <HiUser className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{adminStats.totalStudents}</div>
              <div className="stat-card-info">Inscrits</div>
            </div>
            <div className="student-stat-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Cours disponibles</span>
                <HiBookOpen className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{adminStats.totalCourses}</div>
              <div className="stat-card-info">+9 ce mois</div>
            </div>
            <div className="student-stat-card student-highlight-card">
              <div className="stat-card-header">
                <span className="stat-card-label">Inscriptions en attente</span>
                <HiClock className="stat-card-icon" />
              </div>
              <div className="stat-card-value">{adminStats.pendingRegistrations}</div>
              <div className="stat-card-info">À traiter</div>
            </div>
            
          </div>

          <div className="student-content-grid">
            {/* COLONNE PRINCIPALE */}
            <div className="student-main-col">
              {/* DEMANDES D'INSCRIPTION EN ATTENTE */}
              <div className="student-content-card">
                <div className="content-card-header">
                  <div>
                    <h2 className="content-card-title">Demandes d'inscription en attente</h2>
                    <p className="content-card-description">Approuvez ou refusez les nouveaux comptes</p>
                  </div>
                  <span className="header-notification-badge" style={{ background: "#ef4444", color: "white", padding: "0.25rem 0.75rem", borderRadius: "12px", fontSize: "0.9rem" }}>
                    {adminStats.pendingRegistrations} nouvelles
                  </span>
                </div>

                <div className="student-activity-list">
                  {pendingRegistrations.map((req) => (
                    <div key={req.id} className="student-activity-item" style={{ justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div className="activity-item-icon" style={{ background: "#7c3aed" }}>
                          <HiUserAdd />
                        </div>
                        <div>
                          <p className="activity-item-action">{req.name}</p>
                          <p className="activity-item-course">{req.role} • {req.email}</p>
                          <p className="activity-item-time">
                            <HiClock className="time-icon" /> {req.date}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button className="student-primary-btn" style={{ background: "#10b981", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                          <HiCheckCircle /> Approuver
                        </button>
                        <button style={{ background: "#ef4444", color: "white", border: "none", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem" }}>
                          <HiBan /> Refuser
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTIVITÉ RÉCENTE DU SYSTÈME */}
              <div className="student-content-card">
                <h2 className="content-card-title">Activité récente du système</h2>
                <div className="student-activity-list">
                  {recentActivity.map((act, i) => (
                    <div key={i} className="student-activity-item">
                      <div className="activity-item-icon" style={{
                        background: act.type === "success" ? "#10b981" : act.type === "warning" ? "#f59e0b" : "#7c3aed"
                      }}>
                        {act.type === "success" ? <HiCheckCircle /> : act.type === "warning" ? <HiExclamationCircle /> : <HiCheckCircle />}
                      </div>
                      <div className="activity-item-details">
                        <p className="activity-item-action">{act.action}</p>
                        <p className="activity-item-course">{act.details}</p>
                        <p className="activity-item-time">
                          <HiClock className="time-icon" /> {act.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SIDEBAR DROITE */}
            <aside className="student-sidebar">
              <div className="student-sidebar-card">
                <h3 className="sidebar-card-title">
                  <HiChartBar className="sidebar-title-icon" />
                  Aperçu rapide
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginTop: "1rem" }}>
                  <div style={{ textAlign: "center", padding: "1rem", background: "#f0fdf4", borderRadius: "10px" }}>
                    <p style={{ fontSize: "0.9rem", color: "#166534" }}>Taux de croissance</p>
                    <p style={{ fontSize: "1.8rem", fontWeight: "700", color: "#166534" }}>+24%</p>
                  </div>
                  <div style={{ textAlign: "center", padding: "1rem", background: "#fefce8", borderRadius: "10px" }}>
                    <p style={{ fontSize: "0.9rem", color: "#a16207" }}>Cours les plus populaires</p>
                    <p style={{ fontSize: "1rem", fontWeight: "600", color: "#a16207" }}>React & Node.js</p>
                  </div>
                </div>
              </div>

              <div className="student-sidebar-card">
                <h3 className="sidebar-card-title">
                  <HiUserGroup className="sidebar-title-icon" />
                  Top 5 Enseignants
                </h3>
                <div className="student-activity-list">
                  {["Dr. Riadh K.", "Prof. Nadia C.", "Dr. Sami B.", "Prof. Leila M.", "Dr. Karim T."].map((name, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0" }}>
                      <span style={{ fontWeight: "500" }}>{i + 1}. {name}</span>
                      <span style={{ color: "#7c3aed", fontWeight: "600" }}>{80 + i * 3} étudiants</span>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      
      {/* FOOTER */}
      <Footer />
      </div>
    </div>
  );
}