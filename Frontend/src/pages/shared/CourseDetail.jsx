// src/pages/CourseDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  HiArrowLeft, HiDownload, HiPlay, HiExternalLink, HiAcademicCap, HiClock, HiFolder,
  HiMenu, HiHome, HiBookOpen, HiClipboardList, HiCalendar, HiChatAlt2,
  HiBell, HiUser, HiX, HiLogout, HiChartBar, HiDocumentText
} from "react-icons/hi";
import { courseService } from "../../services/courseService";
import Footer from "../../components/Footer";
import "../dashboard-base.css";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const data = await courseService.getById(id);
        setCourse(data);
      } catch (err) {
        console.error("Erreur chargement cours:", err);
        alert("Cours non trouvé");
        navigate("/courses");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
    
    // Récupérer l'utilisateur
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }
  }, [id, navigate]);

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
    if (!user) return "U";
    return `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "Utilisateur";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Utilisateur";
  };

  const getEmail = () => user?.email || "user@edunova.tn";

  const getUserRole = () => user?.role || "student";

  const getMenuItems = () => {
    const role = getUserRole();
    
    if (role === "enseignant" || role === "teacher") {
      return [
        { id: "home", label: "Accueil", icon: HiHome, path: "/enseignant/dashboard" },
        { id: "courses", label: "Mes Cours", icon: HiBookOpen, path: "/courses" },
        { id: "assignments", label: "Quiz", icon: HiClipboardList, path: "/enseignant/assignments" },
        { id: "calendar", label: "Planning", icon: HiCalendar, path: "/enseignant/planning" },
        { id: "messaging", label: "Messagerie", icon: HiChatAlt2, path: "/enseignant/messaging" },
        { id: "statistics", label: "Statistiques", icon: HiChartBar, path: "/enseignant/statistics" },
        { id: "resources", label: "Ressources", icon: HiDocumentText, path: "/enseignant/resources" },
      ];
    } else {
      return [
        { id: "home", label: "Accueil", icon: HiHome, path: "/student/dashboard" },
        { id: "courses", label: "Mes Cours", icon: HiBookOpen, path: "/courses" },
        { id: "assignments", label: "Quiz", icon: HiClipboardList, path: "/student/quizzes" },
        { id: "calendar", label: "Calendrier", icon: HiCalendar, path: "/student/calendar" },
        { id: "messaging", label: "Messagerie", icon: HiChatAlt2, path: "/student/messaging" },
      ];
    }
  };

  const menuItems = getMenuItems();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-purple-600 text-2xl">Chargement du cours...</div>
      </div>
    );
  }

  if (!course) return null;

  // Fonction pour générer l'embed YouTube
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
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
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${item.id === "courses" ? "active" : ""}`}
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
                    <button className="profile-dropdown-item" onClick={() => { setProfileMenuOpen(false); navigate("/profile"); }}>
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
        <main className="student-main-content" style={{ background: "#f9fafb" }}>

      {/* HEADER */}
      <header className="student-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo cursor-pointer" onClick={() => navigate("/courses")}>
              <div className="edunova-icon"><HiAcademicCap /></div>
              <span className="edunova-text">eduNova</span> <span className="text-purple-400">• Cours</span>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENU PRINCIPAL */}
      <main className="student-main-content py-8">
        <div className="student-container max-w-5xl mx-auto">

          {/* Bouton Retour */}
          <button
            onClick={() => navigate("/courses")}
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-8 font-medium transition"
          >
            <HiArrowLeft className="text-xl" />
            Retour à mes cours
          </button>

          {/* Carte principale du cours */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-purple-100">

            {/* En-tête coloré */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-4xl font-bold mb-3">{course.title}</h1>
                  <div className="flex items-center gap-4 text-purple-100">
                    <span className="flex items-center gap-2">
                      <HiClock /> Créé le {new Date(course.createdAt).toLocaleDateString("fr-FR", {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
                <div className="bg-white/20 backdrop-blur p-4 rounded-xl">
                  <HiFolder className="text-6xl" />
                </div>
              </div>
            </div>

            {/* Description */}
            {course.description && (
              <div className="p-8 border-b border-gray-100">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Description</h2>
                <p className="text-gray-700 leading-relaxed text-lg">{course.description}</p>
              </div>
            )}

            {/* Contenus */}
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                Contenus du cours ({course.contents?.length || 0})
              </h2>

              {course.contents && course.contents.length > 0 ? (
                <div className="space-y-6">
                  {course.contents.map((item, index) => (
                    <div
                      key={index}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-purple-600 text-white p-4 rounded-lg">
                            {item.type === "video" ? <HiPlay className="text-2xl" /> : <HiFolder className="text-2xl" />}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg text-gray-800">
                              {item.type === "pdf" ? "Document PDF" :
                               item.type === "video" ? "Vidéo" : "Fichier"}
                            </h3>
                            <p className="text-gray-600">
                              {item.name || item.url || "Contenu sans titre"}
                            </p>
                          </div>
                        </div>

                        {/* Action selon le type */}
                        {item.type === "video" && item.url && getYouTubeEmbedUrl(item.url) ? (
                          <button
                            onClick={() => {
                              const win = window.open(getYouTubeEmbedUrl(item.url), '_blank');
                              win.focus();
                            }}
                            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition"
                          >
                            <HiPlay /> Regarder
                          </button>
                        ) : item.url ? (
                          <a
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-purple-600 text-white px-5 py-3 rounded-lg hover:bg-purple-700 transition"
                          >
                            <HiExternalLink /> Ouvrir
                          </a>
                        ) : item.file ? (
                          <a
                            href={URL.createObjectURL(item.file)}
                            download={item.name}
                            className="flex items-center gap-2 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition"
                          >
                            <HiDownload /> Télécharger
                          </a>
                        ) : (
                          <span className="text-gray-400 italic">Non disponible</span>
                        )}
                      </div>

                      {/* Aperçu vidéo intégré (optionnel) */}
                      {item.type === "video" && item.url && getYouTubeEmbedUrl(item.url) && (
                        <div className="mt-6">
                          <div className="aspect-w-16 aspect-h-9 bg-black rounded-lg overflow-hidden shadow-xl">
                            <iframe
                              src={getYouTubeEmbedUrl(item.url)}
                              title={item.name || "Vidéo"}
                              allowFullScreen
                              className="w-full h-96"
                            ></iframe>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <HiFolder className="mx-auto text-8xl text-purple-200 mb-4" />
                  <p className="text-xl">Aucun contenu disponible pour ce cours</p>
                </div>
              )}
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