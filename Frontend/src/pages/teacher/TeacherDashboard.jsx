import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiMenu,
  HiHome,
  HiBookOpen,
  HiClipboardList,
  HiCalendar,
  HiChatAlt2,
  HiUser,
  HiFolder,
  HiChartBar,
  HiX,
  HiDocumentText,
  HiClock,
  HiLogout,
  HiQuestionMarkCircle,
  HiCheckCircle,
  HiAcademicCap,
  HiPlus,
  HiPencil,
  HiTrash,
  HiUpload,
  HiLink,
} from "react-icons/hi";
import { courseService } from "../../services/courseService";
import { dashboardService } from "../../services/dashboardService";
import InstantMessaging from "../../components/InstantMessaging";
import NotificationDropdown from "../../components/NotificationDropdown";
import Footer from "../../components/Footer";
import "./TeacherDashboard.css"; // CSS spécifique enseignant

export default function TeacherDashboard({ handleLogout = () => {} }) {
  const navigate = useNavigate();

  // États généraux
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState("home");
  const [user, setUser] = useState(null);

  // États cours dynamiques
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pendingEvaluations: 0 });

  // États données dynamiques sidebar
  const [schedule, setSchedule] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  // États modal cours
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [currentCourseId, setCurrentCourseId] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [contents, setContents] = useState([]);

  // États modal planning
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    course_id: "",
    title: "",
    description: "",
    scheduled_date: "",
    duration_minutes: 60,
    location: "",
    type: "lecture"
  });
  const [scheduleErrors, setScheduleErrors] = useState({});

  const fileInputRef = useRef(null);
  const videoUrlRef = useRef(null);

  // ===================== CHARGEMENT USER + COURS =====================
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }

    const fetchCourses = async () => {
      try {
        console.log('🔍 Chargement des cours...');
        const data = await courseService.getAll();
        console.log('✅ Cours reçus:', data);
        console.log('📊 Nombre de cours:', data?.length || 0);
        setCourses(data || []);
      } catch (err) {
        console.error("❌ Erreur chargement cours:", err);
        setCourses([]);
      } finally {
        setLoading(false);
        console.log('✅ Chargement terminé');
      }
    };
    
    const fetchDashboardData = async () => {
      try {
        setLoadingDashboard(true);
        
        // Charger les données en parallèle
        const [statsData, scheduleData] = await Promise.all([
          dashboardService.getStats().catch(() => ({ pendingEvaluations: 0 })),
          dashboardService.getSchedule().catch(() => [])
        ]);
        
        setStats(statsData);
        setSchedule(scheduleData);
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
      } finally {
        setLoadingDashboard(false);
      }
    };
    
    fetchCourses();
    fetchDashboardData();
  }, []);

  // ===================== GESTION CLAVIER (Escape) =====================
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setProfileMenuOpen(false);
        setModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // ===================== FONCTIONS UI =====================
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

  // ===================== DONNÉES DYNAMIQUES =====================
  const teacherData = {
    totalCourses: stats.totalCourses || courses.length,
    totalStudents: stats.totalStudents || courses.reduce((sum, course) => {
      return sum + (course.students_count || 0);
    }, 0),
    totalResources: stats.totalResources || courses.reduce((sum, course) => {
      return sum + (course.contents_count || 0);
    }, 0),
    pendingEvaluations: stats.pendingEvaluations || 0,
    pendingQuestions: stats.pendingQuestions || 0,
  };

  // Planning (dynamique) - Filtrer pour les 2 prochains jours seulement
  const upcomingClasses = schedule.length > 0 ? schedule.filter(s => {
    const sessionDate = new Date(s.scheduled_date);
    const now = new Date();
    const twoDaysFromNow = new Date(now);
    twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
    twoDaysFromNow.setHours(23, 59, 59, 999);
    
    return sessionDate >= now && sessionDate <= twoDaysFromNow;
  }).map(s => ({
    id: s.id,
    title: `${s.course_title} - ${s.title}`,
    date: formatScheduleDate(s.scheduled_date),
    students: s.students_count || 0,
    type: s.type,
    location: s.location
  })) : [];

  // Helper pour formater le temps
  function formatTimeAgo(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    return `Il y a ${diffDays} jours`;
  }

  // Helper pour formater la date du planning
  function formatScheduleDate(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    
    if (date.toDateString() === today.toDateString()) {
      return `Aujourd'hui, ${timeStr}`;
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return `Demain, ${timeStr}`;
    }
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + `, ${timeStr}`;
  }

  const teacherMenuItems = [
    { id: "home", label: "Accueil", icon: HiHome },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen },
    { id: "assignments", label: "Quiz", icon: HiClipboardList },
    { id: "calendar", label: "Planning", icon: HiCalendar },
    { id: "messaging", label: "Messagerie", icon: HiChatAlt2 },
    { id: "statistics", label: "Statistiques", icon: HiChartBar },
    { id: "resources", label: "Ressources", icon: HiDocumentText },
  ];

  // ===================== MODAL COURS =====================
  const openCreateModal = () => {
    setIsEdit(false);
    setCurrentCourseId(null);
    setTitle("");
    setDescription("");
    setContents([]);
    setModalOpen(true);
  };

  const openEditModal = (course) => {
    setIsEdit(true);
    setCurrentCourseId(course.id);
    setTitle(course.title || "");
    setDescription(course.description || "");
    setContents([]); // Tu pourras charger les contenus existants plus tard
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setTitle("");
    setDescription("");
    setContents([]);
  };

  const addFileContent = (files) => {
    if (!files || files.length === 0) return;
    const newItems = Array.from(files).map((file) => ({
      type: file.type.includes("pdf") ? "pdf" : "file",
      name: file.name,
      file,
    }));
    setContents((prev) => [...prev, ...newItems]);
  };

  const addVideoUrl = () => {
    const url = videoUrlRef.current?.value.trim();
    if (!url) return alert("Colle un lien vidéo valide");
    setContents((prev) => [
      ...prev,
      {
        type: "video",
        name: url.includes("youtube") || url.includes("youtu.be") ? "Vidéo YouTube" : "Vidéo externe",
        url,
      },
    ]);
    videoUrlRef.current.value = "";
  };

  const removeContent = (index) => {
    setContents((prev) => prev.filter((_, i) => i !== index));
  };

  const saveCourse = async () => {
    if (!title.trim()) return alert("Le titre du cours est obligatoire");

    try {
      if (isEdit && currentCourseId) {
        await courseService.update(currentCourseId, { title, description, contents });
      } else {
        await courseService.create({ title, description, contents });
      }
      const updated = await courseService.getAll();
      setCourses(updated || []);
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce cours définitivement ?")) return;
    try {
      await courseService.delete(id);
      setCourses((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  // ===================== GESTION PLANNING =====================
  const openScheduleModal = () => {
    setScheduleForm({
      course_id: "",
      title: "",
      description: "",
      scheduled_date: "",
      duration_minutes: 60,
      location: "",
      type: "lecture"
    });
    setScheduleErrors({});
    setScheduleModalOpen(true);
  };

  const closeScheduleModal = () => {
    setScheduleModalOpen(false);
    setScheduleForm({
      course_id: "",
      title: "",
      description: "",
      scheduled_date: "",
      duration_minutes: 60,
      location: "",
      type: "lecture"
    });
    setScheduleErrors({});
  };

  const validateScheduleForm = () => {
    const errors = {};
    
    if (!scheduleForm.course_id) {
      errors.course_id = "Veuillez sélectionner un cours";
    }
    
    if (!scheduleForm.title.trim()) {
      errors.title = "Le titre est obligatoire";
    } else if (scheduleForm.title.trim().length < 3) {
      errors.title = "Le titre doit contenir au moins 3 caractères";
    } else if (scheduleForm.title.trim().length > 255) {
      errors.title = "Le titre ne peut pas dépasser 255 caractères";
    }
    
    if (!scheduleForm.scheduled_date) {
      errors.scheduled_date = "La date et l'heure sont obligatoires";
    } else {
      const selectedDate = new Date(scheduleForm.scheduled_date);
      const now = new Date();
      if (selectedDate < now) {
        errors.scheduled_date = "La date doit être dans le futur";
      }
    }
    
    if (!scheduleForm.duration_minutes || scheduleForm.duration_minutes < 15) {
      errors.duration_minutes = "La durée minimale est de 15 minutes";
    } else if (scheduleForm.duration_minutes > 480) {
      errors.duration_minutes = "La durée maximale est de 8 heures (480 minutes)";
    }
    
    if (scheduleForm.description && scheduleForm.description.length > 1000) {
      errors.description = "La description ne peut pas dépasser 1000 caractères";
    }
    
    if (scheduleForm.location && scheduleForm.location.length > 255) {
      errors.location = "Le lieu ne peut pas dépasser 255 caractères";
    }
    
    setScheduleErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleScheduleChange = (field, value) => {
    setScheduleForm(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (scheduleErrors[field]) {
      setScheduleErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const saveSchedule = async () => {
    if (!validateScheduleForm()) {
      return;
    }

    try {
      await dashboardService.createSchedule(scheduleForm);
      
      // Recharger le planning
      const updatedSchedule = await dashboardService.getSchedule();
      setSchedule(updatedSchedule);
      
      closeScheduleModal();
      alert("Session planifiée avec succès !");
    } catch (err) {
      console.error("Erreur création planning:", err);
      alert("Erreur lors de la création de la session. Veuillez réessayer.");
    }
  };

  const deleteSchedule = async (id) => {
    if (!window.confirm("Supprimer cette session du planning ?")) return;
    
    try {
      await dashboardService.deleteSchedule(id);
      setSchedule(prev => prev.filter(s => s.id !== id));
      alert("Session supprimée avec succès");
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression");
    }
  };

  // ===================== RENDER =====================
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
  if (item.id === "courses") {
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

        <div className="sidebar-quick-actions">
          <div className="sidebar-section-title">Actions rapides</div>
          <button className="sidebar-nav-item" onClick={openCreateModal}>
            <HiPlus className="sidebar-nav-icon" />
            <span>Créer un cours</span>
          </button>
          <button className="sidebar-nav-item" onClick={openScheduleModal}>
            <HiCalendar className="sidebar-nav-icon" />
            <span>Planifier une session</span>
          </button>
          <button className="sidebar-nav-item" onClick={() => navigate("/enseignant/resources")}>
            <HiDocumentText className="sidebar-nav-icon" />
            <span>Voir les ressources</span>
          </button>
          <button className="sidebar-nav-item" onClick={() => navigate("/enseignant/statistics")}>
            <HiChartBar className="sidebar-nav-icon" />
            <span>Voir les statistiques</span>
          </button>
        </div>

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
          <div className="page-header">
            <h1 className="page-main-title">Tableau de bord Enseignant</h1>
            <p className="page-main-subtitle">
              Bienvenue, <strong>{getFullName()}</strong> ! Continuez votre progression
            </p>
          </div>

          {/* STATISTIQUES DÉTAILLÉES */}
          <div className="teacher-stats-section">
            <div className="stats-header">
              <h2 className="stats-title">
                <HiChartBar className="stats-title-icon" />
                Statistiques et Performance
              </h2>
              <p className="stats-subtitle">Vue d'ensemble de votre activité d'enseignement</p>
            </div>

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
                <div className="stat-card-info">Inscrits actifs</div>
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
                  <span className="stat-card-label">Questions en attente</span>
                  <HiQuestionMarkCircle className="stat-card-icon" />
                </div>
                <div className="stat-card-value">{teacherData.pendingQuestions}</div>
                <div className="stat-card-info">À répondre</div>
              </div>
            </div>

            {/* Statistiques détaillées par cours */}
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
                    <span className="stat-detail-value-large">{Math.floor(teacherData.totalStudents * 0.65)}</span>
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
          </div>

          <div className="student-content-grid">
            {/* COLONNE PRINCIPALE */}
            <div className="student-main-col">
              {/* MES COURS (DYNAMIQUE) */}
              <div className="student-content-card">
                <div className="content-card-header">
                  <div>
                    <h2 className="content-card-title">Mes cours</h2>
                    <p className="content-card-description">Gérez vos cours et suivez la progression</p>
                  </div>
                  <button onClick={openCreateModal} className="student-primary-btn">
                    <HiPlus className="mr-2" /> Créer un cours
                  </button>
                </div>

                {loading ? (
                  <p className="text-center py-12 text-gray-500">Chargement des cours...</p>
                ) : courses.length === 0 ? (
                  <div className="text-center py-16">
                    <HiBookOpen className="mx-auto text-6xl text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">Aucun cours créé pour le moment</p>
                    <p className="text-gray-400 text-sm mt-2">Debug: loading={loading.toString()}, courses.length={courses.length}</p>
                    <button onClick={openCreateModal} className="mt-4 text-purple-600 font-medium underline">
                      Créer votre premier cours
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-gray-400 mb-2">Debug: Affichage de {courses.length} cours (3 max)</p>
                    <div className="student-courses-list">
                      {courses.slice(0, 3).map((course) => (
                        <div
                          key={course.id}
                          className="student-course-card group"
                          onClick={() => navigate(`/enseignant/course/${course.id}`)}
                          style={{ cursor: "pointer" }}
                        >
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
                              onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                              className="course-action-btn course-edit-btn"
                              title="Modifier"
                            >
                              <HiPencil />
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(course.id); }}
                              className="course-action-btn course-delete-btn"
                              title="Supprimer"
                            >
                              <HiTrash />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {courses.length > 3 && (
                      <div style={{ textAlign: "center", marginTop: "1rem" }}>
                        <button 
                          onClick={() => navigate("/courses")} 
                          className="student-primary-btn"
                          style={{ background: "transparent", color: "#7c3aed", border: "1px solid #7c3aed" }}
                        >
                          Voir tous les cours ({courses.length})
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* MESSAGERIE INSTANTANÉE */}
              <div className="student-content-card messaging-section">
                <h2 className="content-card-title">Messagerie avec les étudiants</h2>
                <InstantMessaging user={user} />
              </div>
            </div>

            {/* SIDEBAR DROITE */}
            <aside className="student-sidebar">
              {/* PLANNING */}
              <div className="student-content-card">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="content-card-title">
                    Prochains cours (2 jours)
                  </h3>
                  <button 
                    onClick={openScheduleModal}
                    className="student-primary-btn"
                    style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}
                  >
                    <HiPlus className="mr-1" /> Planifier
                  </button>
                </div>
                {loadingDashboard ? (
                  <p className="text-center py-4 text-gray-500">Chargement...</p>
                ) : upcomingClasses.length === 0 ? (
                  <div className="text-center py-6">
                    <HiCalendar className="mx-auto text-3xl text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">Aucun cours dans les 2 prochains jours</p>
                    <button 
                      onClick={openScheduleModal}
                      className="mt-2 text-purple-600 text-sm underline"
                    >
                      Planifier un cours
                    </button>
                  </div>
                ) : (
                  <div className="student-events-list">
                    {upcomingClasses.map((c, i) => (
                      <div key={c.id || i} className="student-event-item group">
                        <div className={`event-type-badge ${c.type || 'lecture'}`}><HiFolder /></div>
                        <div className="event-item-content flex-1">
                          <p className="event-item-title">{c.title}</p>
                          <p className="event-item-date">
                            <HiClock className="event-clock-icon" /> {c.date} • {c.students} étudiants
                          </p>
                          {c.location && <p className="event-item-location text-xs text-gray-400">{c.location}</p>}
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteSchedule(c.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-red-500 hover:text-red-700 p-2"
                          title="Supprimer"
                        >
                          <HiTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </aside>
          </div>
        </div>
      </main>

      {/* MODAL CRÉATION / ÉDITION COURS */}
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
                    onDrop={(e) => { e.preventDefault(); addFileContent(e.dataTransfer.files); }}
                    onClick={() => fileInputRef.current?.click()}
                    className="modal-dropzone"
                  >
                    <HiUpload className="modal-dropzone-icon" />
                    <p className="modal-dropzone-title">Glissez vos fichiers ici</p>
                    <p className="modal-dropzone-subtitle">ou cliquez pour sélectionner</p>
                    <input ref={fileInputRef} type="file" multiple hidden onChange={(e) => addFileContent(e.target.files)} />
                  </div>
                </div>

                <div className="modal-form-group">
                  <label className="modal-label">Ajouter une vidéo</label>
                  <div className="modal-video-input">
                    <input ref={videoUrlRef} type="text" placeholder="Lien YouTube ou URL de la vidéo" className="modal-input" />
                    <button onClick={addVideoUrl} className="modal-video-btn"><HiLink /> Ajouter</button>
                  </div>
                </div>

                {contents.length > 0 && (
                  <div className="modal-form-group">
                    <label className="modal-label">Contenus ajoutés ({contents.length})</label>
                    <div className="modal-contents-list">
                      {contents.map((item, idx) => (
                        <div key={idx} className="modal-content-item">
                          <span className="modal-content-type">
                            {item.type === "pdf" && "PDF"}
                            {item.type === "file" && "File"}
                            {item.type === "video" && "Video"}
                          </span>
                          <span className="modal-content-name">{item.name || item.url}</span>
                          <button onClick={() => removeContent(idx)} className="modal-content-remove"><HiX /></button>
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

      {/* MODAL PLANIFICATION SESSION */}
      {scheduleModalOpen && (
        <>
          <div className="modal-overlay" onClick={closeScheduleModal} />
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Planifier une session</h2>
                <button onClick={closeScheduleModal} className="modal-close-btn"><HiX /></button>
              </div>
              <div className="modal-body">
                {/* Sélection du cours */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    Cours <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={scheduleForm.course_id}
                    onChange={(e) => handleScheduleChange('course_id', e.target.value)}
                    className={`modal-input ${scheduleErrors.course_id ? 'border-red-500' : ''}`}
                  >
                    <option value="">Sélectionnez un cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {scheduleErrors.course_id && (
                    <p className="text-red-500 text-sm mt-1">{scheduleErrors.course_id}</p>
                  )}
                </div>

                {/* Type de session */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    Type de session <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={scheduleForm.type}
                    onChange={(e) => handleScheduleChange('type', e.target.value)}
                    className="modal-input"
                  >
                    <option value="lecture">Cours magistral</option>
                    <option value="lab">Travaux pratiques</option>
                    <option value="exam">Examen</option>
                    <option value="office_hours">Permanence</option>
                  </select>
                </div>

                {/* Titre */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    Titre de la session <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={scheduleForm.title}
                    onChange={(e) => handleScheduleChange('title', e.target.value)}
                    className={`modal-input ${scheduleErrors.title ? 'border-red-500' : ''}`}
                    placeholder="Ex: Introduction aux composants React"
                    maxLength={255}
                  />
                  {scheduleErrors.title && (
                    <p className="text-red-500 text-sm mt-1">{scheduleErrors.title}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {scheduleForm.title.length}/255 caractères
                  </p>
                </div>

                {/* Date et heure */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    Date et heure <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={scheduleForm.scheduled_date}
                    onChange={(e) => handleScheduleChange('scheduled_date', e.target.value)}
                    className={`modal-input ${scheduleErrors.scheduled_date ? 'border-red-500' : ''}`}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  {scheduleErrors.scheduled_date && (
                    <p className="text-red-500 text-sm mt-1">{scheduleErrors.scheduled_date}</p>
                  )}
                </div>

                {/* Durée */}
                <div className="modal-form-group">
                  <label className="modal-label">
                    Durée (minutes) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={scheduleForm.duration_minutes}
                    onChange={(e) => handleScheduleChange('duration_minutes', parseInt(e.target.value) || 0)}
                    className={`modal-input ${scheduleErrors.duration_minutes ? 'border-red-500' : ''}`}
                    min={15}
                    max={480}
                    step={15}
                  />
                  {scheduleErrors.duration_minutes && (
                    <p className="text-red-500 text-sm mt-1">{scheduleErrors.duration_minutes}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    Entre 15 minutes et 8 heures (480 min)
                  </p>
                </div>

                {/* Lieu */}
                <div className="modal-form-group">
                  <label className="modal-label">Lieu (facultatif)</label>
                  <input
                    type="text"
                    value={scheduleForm.location}
                    onChange={(e) => handleScheduleChange('location', e.target.value)}
                    className={`modal-input ${scheduleErrors.location ? 'border-red-500' : ''}`}
                    placeholder="Ex: Salle A101, Amphithéâtre B, En ligne"
                    maxLength={255}
                  />
                  {scheduleErrors.location && (
                    <p className="text-red-500 text-sm mt-1">{scheduleErrors.location}</p>
                  )}
                </div>

                {/* Description */}
                <div className="modal-form-group">
                  <label className="modal-label">Description (facultatif)</label>
                  <textarea
                    rows={4}
                    value={scheduleForm.description}
                    onChange={(e) => handleScheduleChange('description', e.target.value)}
                    className={`modal-textarea ${scheduleErrors.description ? 'border-red-500' : ''}`}
                    placeholder="Détails de la session, préparation requise, etc."
                    maxLength={1000}
                  />
                  {scheduleErrors.description && (
                    <p className="text-red-500 text-sm mt-1">{scheduleErrors.description}</p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {scheduleForm.description.length}/1000 caractères
                  </p>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={closeScheduleModal} className="modal-btn modal-btn-cancel">
                  Annuler
                </button>
                <button onClick={saveSchedule} className="modal-btn modal-btn-save">
                  <HiCalendar className="mr-2" /> Planifier
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* FOOTER */}
      <Footer />
      </div>
    </div>
  );
}