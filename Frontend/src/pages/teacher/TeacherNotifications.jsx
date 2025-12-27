import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiBell,
  HiX,
  HiCheckCircle,
  HiExclamationCircle,
  HiInformationCircle,
  HiClock,
  HiMenu,
  HiHome,
  HiBookOpen,
  HiClipboardList,
  HiCalendar,
  HiChatAlt2,
  HiUser,
  HiLogout,
  HiAcademicCap,
  HiChartBar,
  HiDocumentText,
  HiTrash,
} from "react-icons/hi";
import { messagingService } from "../../services/messagingService";
import NotificationDropdown from "../../components/NotificationDropdown";
import Footer from "../../components/Footer";
import "./TeacherDashboard.css";
import "./TeacherNotifications.css";

export default function TeacherNotifications() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [loading, setLoading] = useState(true);

  const teacherMenuItems = [
    { id: "home", label: "Accueil", icon: HiHome, path: "/enseignant/dashboard" },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen, path: "/courses" },
    { id: "assignments", label: "Quiz", icon: HiClipboardList, path: "/enseignant/assignments" },
    { id: "calendar", label: "Planning", icon: HiCalendar, path: "/enseignant/planning" },
    { id: "messaging", label: "Messagerie", icon: HiChatAlt2, path: "/enseignant/messaging" },
    { id: "statistics", label: "Statistiques", icon: HiChartBar, path: "/enseignant/statistics" },
    { id: "resources", label: "Ressources", icon: HiDocumentText, path: "/enseignant/resources" },
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }
    fetchNotifications();
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

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      // Utiliser des données de démonstration
      const demoNotifications = [
        {
          id: 1,
          type: "success",
          title: "Quiz complété",
          message: "L'étudiant Ahmed Ben Ali a terminé le quiz 'Introduction à React'",
          time: "Il y a 5 minutes",
          read: false,
          created_at: new Date(Date.now() - 5 * 60 * 1000)
        },
        {
          id: 2,
          type: "info",
          title: "Nouveau message",
          message: "Vous avez reçu un nouveau message de Sarah Trabelsi",
          time: "Il y a 1 heure",
          read: false,
          created_at: new Date(Date.now() - 60 * 60 * 1000)
        },
        {
          id: 3,
          type: "warning",
          title: "Session planifiée",
          message: "Rappel: Cours de JavaScript prévu demain à 10h00",
          time: "Il y a 2 heures",
          read: false,
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 4,
          type: "info",
          title: "Nouveau cours ajouté",
          message: "Le cours 'Node.js Avancé' a été publié avec succès",
          time: "Il y a 1 jour",
          read: true,
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        {
          id: 5,
          type: "success",
          title: "Évaluation terminée",
          message: "Toutes les évaluations du quiz 'CSS Flexbox' sont complétées",
          time: "Il y a 2 jours",
          read: true,
          created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
          id: 6,
          type: "info",
          title: "Nouveau étudiant inscrit",
          message: "Mohamed Khalil s'est inscrit à votre cours 'React Avancé'",
          time: "Il y a 3 jours",
          read: true,
          created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
      ];
      setNotifications(demoNotifications);
    } catch (err) {
      console.error("Erreur chargement notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "success":
        return <HiCheckCircle className="notif-icon success" />;
      case "warning":
        return <HiExclamationCircle className="notif-icon warning" />;
      case "info":
      default:
        return <HiInformationCircle className="notif-icon info" />;
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === "unread") return !n.read;
    if (filter === "read") return n.read;
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className={`teacher-dashboard-wrapper ${sidebarOpen ? "sidebar-active" : ""}`}>
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
                className="sidebar-nav-item"
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
              <NotificationDropdown />
              
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
            <div className="page-header">
              <div>
                <h1 className="page-main-title">
                  <HiBell style={{ display: "inline", marginRight: "0.5rem" }} />
                  Notifications
                </h1>
                <p className="page-main-subtitle">
                  {unreadCount > 0 ? `${unreadCount} notification${unreadCount > 1 ? 's' : ''} non lue${unreadCount > 1 ? 's' : ''}` : 'Toutes vos notifications sont lues'}
                </p>
              </div>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="student-primary-btn">
                  <HiCheckCircle /> Tout marquer comme lu
                </button>
              )}
            </div>

            {/* Filtres */}
            <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem" }}>
              <button
                onClick={() => setFilter("all")}
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
              >
                Toutes ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              >
                Non lues ({unreadCount})
              </button>
              <button
                onClick={() => setFilter("read")}
                className={`filter-btn ${filter === "read" ? "active" : ""}`}
              >
                Lues ({notifications.length - unreadCount})
              </button>
            </div>

            {loading ? (
              <p className="text-center py-12 text-gray-500">Chargement...</p>
            ) : filteredNotifications.length === 0 ? (
              <div className="student-content-card text-center py-16">
                <HiBell className="mx-auto text-6xl text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">Aucune notification</p>
              </div>
            ) : (
              <div className="notifications-full-list">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notification-full-item ${!notif.read ? "unread" : ""}`}
                  >
                    <div className="notification-full-content">
                      {getIcon(notif.type)}
                      <div className="notification-full-text">
                        <h4>{notif.title}</h4>
                        <p>{notif.message}</p>
                        <span className="notification-full-time">
                          <HiClock /> {notif.time}
                        </span>
                      </div>
                    </div>
                    <div className="notification-full-actions">
                      {!notif.read && (
                        <button
                          className="notif-action-btn mark-read-btn"
                          onClick={() => markAsRead(notif.id)}
                          title="Marquer comme lu"
                        >
                          <HiCheckCircle />
                        </button>
                      )}
                      <button
                        className="notif-action-btn delete-btn"
                        onClick={() => deleteNotification(notif.id)}
                        title="Supprimer"
                      >
                        <HiTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
