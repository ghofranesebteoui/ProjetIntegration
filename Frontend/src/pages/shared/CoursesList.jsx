import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiPlus, HiPencil, HiTrash, HiEye, HiX, HiFolder,
  HiArrowLeft, HiAcademicCap, HiSearch, HiLink, HiUpload,
  HiMenu, HiHome, HiBookOpen, HiClipboardList, HiCalendar,
  HiChatAlt2, HiBell, HiUser, HiLogout, HiChartBar, HiDocumentText
} from "react-icons/hi";
import { courseService } from "../../services/courseService";
import Footer from "../../components/Footer";
import "../dashboard-base.css";

export default function CoursesList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  // Modal création/édition
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contents, setContents] = useState([]);

  const fileInputRef = useRef(null);
  const videoUrlRef = useRef(null);

  // États recherche
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchCourses();
    
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
    if (!user) return "U";
    return `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase();
  };

  const getFullName = () => {
    if (!user) return "Utilisateur";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Utilisateur";
  };

  const getEmail = () => user?.email || "user@edunova.tn";

  const getUserRole = () => user?.role || "student";

  const fetchCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(data || []);
    } catch (err) {
      console.error(err);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  // === Fonctions modals (inchangées) ===
  const openDetailModal = (c) => { setSelectedCourse(c); setDetailModalOpen(true); };
  const closeDetailModal = () => { setDetailModalOpen(false); setSelectedCourse(null); };

  const openCreateModal = () => {
    setIsEdit(false); setCurrentCourseId(null); setTitle(""); setDescription(""); setContents([]); setModalOpen(true);
  };

  const openEditModal = (c) => {
    setIsEdit(true); setCurrentCourseId(c.id); setTitle(c.title || ""); setDescription(c.description || ""); setContents(c.contents || []); setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setTitle(""); setDescription(""); setContents([]); setCurrentCourseId(null); };

  const addFileContent = (files) => { /* inchangé */ };
  const addVideoUrl = () => { /* inchangé */ };
  const removeContent = (i) => setContents(prev => prev.filter((_, idx) => idx !== i));

  const saveCourse = async () => { /* inchangé */ };
  const handleDelete = async (id) => { /* inchangé */ };

  // Déterminer les items du menu selon le rôle
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

  // Filtrage des cours
  const filteredCourses = courses.filter(course =>
    !isSearchOpen || !searchTerm ||
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              {/* Bouton recherche */}
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="header-icon-btn"
                aria-label="Rechercher"
              >
                <HiSearch />
              </button>

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

        {/* BARRE DE RECHERCHE */}
        {isSearchOpen && (
          <div className="search-bar-container" style={{ padding: "1rem 1.5rem", background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative" }}>
              <input
                type="text"
                placeholder="Rechercher dans vos cours..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                style={{
                  width: "100%",
                  padding: "0.75rem 3rem 0.75rem 1rem",
                  border: "2px solid #7c3aed",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  outline: "none"
                }}
              />
              <button
                onClick={() => {
                  setSearchTerm("");
                  setIsSearchOpen(false);
                }}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "#7c3aed",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  width: "2.5rem",
                  height: "2.5rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer"
                }}
              >
                <HiX />
              </button>
              {searchTerm && (
                <p style={{ marginTop: "0.5rem", fontSize: "0.875rem", color: "#6b7280" }}>
                  {filteredCourses.length} cours trouvé{filteredCourses.length > 1 ? "s" : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* CONTENU PRINCIPAL */}
        <main className="student-main-content">
          <div className="student-container">

            <div className="page-header">
            <h1 className="page-main-title">Mes Cours</h1>
            <p className="page-main-subtitle">Gérez tous vos cours en un seul endroit</p>
          </div>

          <div className="text-right mb-8">
            <button onClick={openCreateModal} className="course-btn1 text-lg px-8 py-4">
              <HiPlus className="mr-2" /> Créer un cours
            </button>
          </div>
          <div className="text-left mb-8">
            <button onClick={() => navigate("/enseignant")} className="course-btn2 text-lg px-8 py-4">
              <HiArrowLeft className="mr-2" /> Retour au tableau de bord
            </button>
          </div>

          {loading ? (
            <p className="text-center py-20 text-gray-500 text-xl">Chargement...</p>
          ) : courses.length === 0 ? (
            <div className="text-center py-32"> {/* état vide inchangé */} </div>
          ) : (
            <div className="student-courses-list">

              {filteredCourses.map(course => (
                <div key={course.id} className="student-course-card group">
                  <div className="course-card-icon"><HiFolder /></div>
                  <div className="course-card-details flex-1">
                    <h3 className="course-card-title">{course.title}</h3>
                    <p className="course-card-meta">
                      {course.description || "Aucune description"} • Créé le{" "}
                      {new Date(course.createdAt || Date.now()).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        navigate(`/enseignant/course/${course.id}`); 
                      }} 
                      className="course-action-btn course-edit-btn" 
                      title="Voir"
                    >
                      <HiEye />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); openEditModal(course); }} className="course-action-btn course-edit-btn" title="Modifier"><HiPencil /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }} className="course-action-btn course-delete-btn" title="Supprimer"><HiTrash /></button>
                  </div>
                </div>
              ))}

              {/* Aucun résultat trouvé */}
              {isSearchOpen && searchTerm && filteredCourses.length === 0 && (
                <div className="text-center py-32">
                  <div className="bg-purple-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
                    <HiSearch className="text-6xl text-purple-300" />
                  </div>
                  <p className="text-2xl text-gray-700 mb-2">Aucun cours trouvé</p>
                  <p className="text-lg text-purple-600 font-medium">pour "<span className="italic">{searchTerm}</span>"</p>
                </div>
              )}
            </div>
          )}
          
          </div> {/* Fin student-container */}

      {/* MODAL IDENTIQUE AU DASHBOARD (violet & magnifique) */}
      {modalOpen && (
        <>
          <div className="modal-overlay" onClick={closeModal} />
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">{isEdit ? "Modifier le cours" : "Créer un nouveau cours"}</h2>
                <button onClick={closeModal} className="modal-close-btn"><HiX /></button>
              </div>

              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-label">Titre du cours <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="modal-input"
                    placeholder="Ex: Développement Web Avancé"
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Description (facultatif)</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="modal-textarea"
                    placeholder="Décrivez brièvement le contenu..."
                  />
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Fichiers (PDF, documents...)</label>
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      addFileContent(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className="modal-dropzone"
                  >
                    <HiUpload className="modal-dropzone-icon" />
                    <p className="modal-dropzone-title">Glissez vos fichiers ici</p>
                    <p className="modal-dropzone-subtitle">ou cliquez pour sélectionner</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      hidden
                      onChange={(e) => addFileContent(e.target.files)}
                    />
                  </div>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Ajouter une vidéo</label>
                  <div className="modal-video-input">
                    <input
                      ref={videoUrlRef}
                      type="text"
                      placeholder="Lien YouTube ou URL de la vidéo"
                      className="modal-input"
                    />
                    <button onClick={addVideoUrl} className="modal-video-btn">
                      <HiLink /> Ajouter
                    </button>
                  </div>
                </div>

                {contents.length > 0 && (
                  <div className="modal-form-group">
                    <label className="modal-label">Contenus ajoutés ({contents.length})</label>
                    <div className="modal-contents-list">
                      {contents.map((item, idx) => (
                        <div key={idx} className="modal-content-item">
                          <span className="modal-content-type">
                            {item.type === "pdf" ? "PDF" : item.type === "video" ? "Vidéo" : "Fichier"}
                          </span>
                          <span className="modal-content-name">{item.name || item.url}</span>
                          <button onClick={() => removeContent(idx)} className="modal-content-remove">
                            <HiX />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={closeModal} className="modal-btn modal-btn-cancel">Annuler</button>
                <button onClick={saveCourse} className="modal-btn modal-btn-save">
                  {isEdit ? "Mettre à jour" : "Créer le cours"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
            {/* MODAL DE DÉTAIL DU COURS */}
      {detailModalOpen && selectedCourse && (
        <>
          <div className="modal-overlay" onClick={closeDetailModal} />
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Détail du cours : {selectedCourse.title}</h2>
                <button onClick={closeDetailModal} className="modal-close-btn">
                  <HiX />
                </button>
              </div>

              <div className="modal-body space-y-6">

                {/* Description */}
                <div>
                  <label className="modal-label">Description</label>
                  <p className="bg-gray-50 p-4 rounded-lg text-gray-700">
                    {selectedCourse.description || "Aucune description fournie."}
                  </p>
                </div>

                {/* Date de création */}
                <div>
                  <label className="modal-label">Créé le</label>
                  <p className="text-gray-600">
                    {new Date(selectedCourse.createdAt || Date.now()).toLocaleDateString("fr-FR", {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Contenus */}
                {selectedCourse.contents && selectedCourse.contents.length > 0 ? (
                  <div>
                    <label className="modal-label">
                      Contenus ({selectedCourse.contents.length})
                    </label>
                    <div className="space-y-3">
                      {selectedCourse.contents.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-purple-600 font-semibold">
                              {item.type === "pdf" ? "PDF" : item.type === "video" ? "Vidéo" : "Fichier"}
                            </span>
                            <span className="text-gray-700">
                              {item.name || item.url || "Contenu sans nom"}
                            </span>
                          </div>
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-purple-600 hover:underline text-sm"
                            >
                              Ouvrir le lien
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">Aucun contenu attaché à ce cours.</p>
                )}
              </div>

              <div className="modal-footer">
                <button onClick={closeDetailModal} className="modal-btn modal-btn-cancel">
                  Fermer
                </button>
                <button
                  onClick={() => {
                    closeDetailModal();
                    navigate(`/enseignant/course/${selectedCourse.id}`);
                  }}
                  className="modal-btn modal-btn-save"
                >
                  Accéder au cours complet
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
        </main>
        
        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
  
}