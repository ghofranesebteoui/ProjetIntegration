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
  HiSearch,
  HiFilter,
  HiRefresh,
  HiClock,
} from "react-icons/hi";
import InstantMessaging from "../../components/InstantMessaging";
import NotificationDropdown from "../../components/NotificationDropdown";
import Footer from "../../components/Footer";
import "./TeacherDashboard.css";
import "./TeacherMessaging.css";

export default function TeacherMessaging({ handleLogout = () => {} }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("messaging");
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterUnread, setFilterUnread] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState([
    "Ahmed Ben Ali",
    "Sarah Trabelsi",
    "Mohamed Khalil",
  ]);
  const [stats, setStats] = useState({
    totalConversations: 0,
    unreadMessages: 0,
    todayMessages: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }

    // Simuler le chargement des statistiques
    // TODO: Remplacer par un vrai appel API
    setStats({
      totalConversations: 24,
      unreadMessages: 5,
      todayMessages: 12,
    });
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Ajouter à l'historique si pas déjà présent
      if (!recentSearches.includes(searchQuery.trim())) {
        setRecentSearches([searchQuery.trim(), ...recentSearches.slice(0, 4)]);
      }
      // TODO: Implémenter la logique de recherche
      console.log("Recherche:", searchQuery);
    }
  };

  const handleRecentSearchClick = (search) => {
    setSearchQuery(search);
    setSearchFocused(false);
    // TODO: Implémenter la logique de recherche
    console.log("Recherche récente:", search);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchFocused(false);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

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

      {/* MAIN CONTENT */}
      <main className="student-main-content">
        <div className="student-container">
          <div className="page-header messaging-page-header">
            <div className="page-header-left">
              <h1 className="page-main-title">
                <HiChatAlt2 className="page-title-icon" />
                Messagerie
              </h1>
              <p className="page-main-subtitle">
                Communiquez avec vos étudiants en temps réel
              </p>
            </div>
            <div className="page-header-actions">
              <button className="header-action-btn" title="Actualiser">
                <HiRefresh />
              </button>
            </div>
          </div>

          {/* STATISTIQUES MESSAGERIE */}
          <div className="messaging-stats-grid">
            <div className="messaging-stat-card">
              <div className="messaging-stat-icon conversations-icon">
                <HiChatAlt2 />
              </div>
              <div className="messaging-stat-content">
                <span className="messaging-stat-label">Conversations</span>
                <span className="messaging-stat-value">{stats.totalConversations}</span>
              </div>
            </div>
            <div className="messaging-stat-card">
              <div className="messaging-stat-icon unread-icon">
                <HiBell />
              </div>
              <div className="messaging-stat-content">
                <span className="messaging-stat-label">Non lus</span>
                <span className="messaging-stat-value">{stats.unreadMessages}</span>
              </div>
            </div>
            <div className="messaging-stat-card">
              <div className="messaging-stat-icon today-icon">
                <HiClock />
              </div>
              <div className="messaging-stat-content">
                <span className="messaging-stat-label">Aujourd'hui</span>
                <span className="messaging-stat-value">{stats.todayMessages}</span>
              </div>
            </div>
          </div>

          {/* BARRE DE RECHERCHE ET FILTRES */}
          <div className="messaging-toolbar">
            <form className="messaging-search-box" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                placeholder="Rechercher une conversation ou un message..."
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                className="messaging-search-input"
              />
              {searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={clearSearch}
                  title="Effacer"
                >
                  <HiX />
                </button>
              )}
              
              {/* Dropdown de suggestions */}
              {searchFocused && (
                <div className="search-dropdown">
                  {searchQuery ? (
                    <div className="search-results">
                      <div className="search-section-title">Résultats</div>
                      <div className="search-result-item">
                        <HiUser className="result-icon" />
                        <div className="result-content">
                          <p className="result-name">Rechercher "{searchQuery}"</p>
                          <p className="result-meta">dans toutes les conversations</p>
                        </div>
                      </div>
                    </div>
                  ) : recentSearches.length > 0 ? (
                    <div className="recent-searches">
                      <div className="search-section-header">
                        <span className="search-section-title">Recherches récentes</span>
                        <button
                          type="button"
                          className="clear-history-btn"
                          onClick={clearRecentSearches}
                        >
                          Effacer tout
                        </button>
                      </div>
                      {recentSearches.map((search, index) => (
                        <div
                          key={index}
                          className="recent-search-item"
                          onClick={() => handleRecentSearchClick(search)}
                        >
                          <HiClock className="recent-icon" />
                          <span className="recent-text">{search}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="search-empty">
                      <HiSearch className="empty-search-icon" />
                      <p>Commencez à taper pour rechercher</p>
                    </div>
                  )}
                </div>
              )}
            </form>
            
            <div className="messaging-filters">
              <button
                className={`filter-btn ${filterUnread ? "active" : ""}`}
                onClick={() => setFilterUnread(!filterUnread)}
              >
                <HiFilter />
                Non lus
                {filterUnread && <span className="filter-badge">Actif</span>}
              </button>
            </div>
          </div>

          {/* MESSAGERIE */}
          <div className="student-content-card messaging-full-page">
            <InstantMessaging user={user} />
          </div>

          {/* CONSEILS */}
          <div className="messaging-tips">
            <h3 className="tips-title">💡 Conseils pour une bonne communication</h3>
            <div className="tips-grid">
              <div className="tip-item">
                <span className="tip-icon">⚡</span>
                <p>Répondez rapidement aux questions des étudiants</p>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🎯</span>
                <p>Soyez clair et précis dans vos réponses</p>
              </div>
              <div className="tip-item">
                <span className="tip-icon">🤝</span>
                <p>Encouragez les étudiants à poser des questions</p>
              </div>
              <div className="tip-item">
                <span className="tip-icon">📚</span>
                <p>Partagez des ressources utiles dans vos messages</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* FOOTER */}
      <Footer />
      </div>
    </div>
  );
}
