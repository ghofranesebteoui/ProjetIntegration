import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiDocumentText,
  HiAcademicCap,
  HiFolder,
  HiVideoCamera,
  HiLink,
  HiPhotograph,
  HiDownload,
  HiExternalLink,
  HiClock,
  HiSearch,
  HiMenu,
  HiX,
  HiHome,
  HiBookOpen,
  HiClipboardList,
  HiChatAlt2,
  HiUser,
  HiLogout,
  HiCalendar,
  HiChartBar,
} from "react-icons/hi";
import { dashboardService } from "../../services/dashboardService";
import NotificationDropdown from "../../components/NotificationDropdown";
import Footer from "../../components/Footer";
import "./TeacherDashboard.css";

export default function TeacherResources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pdf, video, link, file
  const [searchTerm, setSearchTerm] = useState("");
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchResources();
    
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

  const fetchResources = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getResources();
      setResources(data || []);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case "pdf": return <HiDocumentText />;
      case "video": return <HiVideoCamera />;
      case "link": return <HiLink />;
      case "image": return <HiPhotograph />;
      default: return <HiFolder />;
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      pdf: "PDF",
      video: "Vidéo",
      link: "Lien",
      image: "Image",
      file: "Fichier"
    };
    return types[type] || type;
  };

  const getTypeColor = (type) => {
    const colors = {
      pdf: { bg: "#fee2e2", color: "#dc2626" },
      video: { bg: "#dbeafe", color: "#2563eb" },
      link: { bg: "#d1fae5", color: "#059669" },
      image: { bg: "#fef3c7", color: "#d97706" },
      file: { bg: "#e5e7eb", color: "#4b5563" }
    };
    return colors[type] || colors.file;
  };

  const filteredResources = resources.filter(r => {
    const matchesFilter = filter === "all" || r.content_type === filter;
    const matchesSearch = !searchTerm || 
      r.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.course_title?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const resourceCounts = {
    all: resources.length,
    pdf: resources.filter(r => r.content_type === "pdf").length,
    video: resources.filter(r => r.content_type === "video").length,
    link: resources.filter(r => r.content_type === "link").length,
    file: resources.filter(r => r.content_type === "file" || r.content_type === "image").length,
  };

  const handleOpen = (resource) => {
    if (resource.url) {
      window.open(resource.url, "_blank");
    } else if (resource.file_path) {
      window.open(`http://localhost:5000/uploads/${resource.file_path}`, "_blank");
    }
  };

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
                className={`sidebar-nav-item ${item.id === "resources" ? "active" : ""}`}
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
            <h1 className="page-main-title">
              <HiDocumentText style={{ display: "inline", marginRight: "0.5rem" }} />
              Mes ressources
            </h1>
            <p className="page-main-subtitle">Toutes les ressources de vos cours ({resources.length} au total)</p>
          </div>

          {/* Barre de recherche */}
          <div style={{ marginBottom: "1rem" }}>
            <div style={{ position: "relative", maxWidth: "400px" }}>
              <HiSearch style={{ 
                position: "absolute", 
                left: "12px", 
                top: "50%", 
                transform: "translateY(-50%)",
                color: "#9ca3af"
              }} />
              <input
                type="text"
                placeholder="Rechercher une ressource..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="modal-input"
                style={{ paddingLeft: "40px" }}
              />
            </div>
          </div>

          {/* Filtres */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            {[
              { key: "all", label: "Tout" },
              { key: "pdf", label: "PDF" },
              { key: "video", label: "Vidéos" },
              { key: "link", label: "Liens" },
              { key: "file", label: "Fichiers" },
            ].map(f => (
              <button 
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`student-primary-btn ${filter !== f.key ? "outline" : ""}`}
                style={filter !== f.key ? { background: "transparent", color: "#7c3aed", border: "1px solid #7c3aed" } : {}}
              >
                {f.label} ({resourceCounts[f.key]})
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-center py-12 text-gray-500">Chargement...</p>
          ) : filteredResources.length === 0 ? (
            <div className="student-content-card text-center py-16">
              <HiDocumentText className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? "Aucune ressource trouvée" : "Aucune ressource pour le moment"}
              </p>
              <button 
                onClick={() => navigate("/courses")}
                className="mt-4 text-purple-600 font-medium underline"
              >
                Ajouter des ressources à vos cours
              </button>
            </div>
          ) : (
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
              gap: "1rem" 
            }}>
              {filteredResources.map((resource) => {
                const typeColor = getTypeColor(resource.content_type);
                return (
                  <div 
                    key={resource.id} 
                    className="student-content-card"
                    style={{ 
                      padding: "1.25rem",
                      cursor: "pointer",
                      transition: "transform 0.2s, box-shadow 0.2s"
                    }}
                    onClick={() => handleOpen(resource)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "";
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
                      <div style={{ 
                        width: "48px", 
                        height: "48px", 
                        borderRadius: "12px",
                        background: typeColor.bg,
                        color: typeColor.color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem",
                        flexShrink: 0
                      }}>
                        {getIcon(resource.content_type)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ 
                          fontWeight: "600", 
                          marginBottom: "0.25rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap"
                        }}>
                          {resource.title || resource.file_name || "Sans titre"}
                        </h3>
                        <p style={{ 
                          color: "#6b7280", 
                          fontSize: "0.875rem",
                          marginBottom: "0.5rem"
                        }}>
                          {resource.course_title}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                          <span style={{ 
                            background: typeColor.bg,
                            color: typeColor.color,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: "500"
                          }}>
                            {getTypeLabel(resource.content_type)}
                          </span>
                          <span style={{ color: "#9ca3af", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "4px" }}>
                            <HiClock /> {formatDate(resource.created_at)}
                          </span>
                        </div>
                      </div>
                      <div style={{ color: "#9ca3af" }}>
                        {resource.url ? <HiExternalLink /> : <HiDownload />}
                      </div>
                    </div>
                  </div>
                );
              })}
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
