import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiCalendar,
  HiPlus,
  HiX,
  HiClock,
  HiLocationMarker,
  HiUserGroup,
  HiTrash,
  HiArrowLeft,
  HiAcademicCap,
  HiMenu,
  HiHome,
  HiBookOpen,
  HiClipboardList,
  HiChatAlt2,
  HiUser,
  HiLogout,
  HiChartBar,
  HiDocumentText,
} from "react-icons/hi";
import { dashboardService } from "../../services/dashboardService";
import { courseService } from "../../services/courseService";
import NotificationDropdown from "../../components/NotificationDropdown";
import Footer from "../../components/Footer";
import "./TeacherDashboard.css";

export default function TeacherPlanning() {
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    scheduled_date: "",
    scheduled_time: "",
    duration_minutes: 60,
    location: "",
    type: "lecture"
  });

  useEffect(() => {
    fetchData();
    
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
        setModalOpen(false);
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

  const fetchData = async () => {
    try {
      setLoading(true);
      const [scheduleData, coursesData] = await Promise.all([
        dashboardService.getSchedule(),
        courseService.getAll()
      ]);
      setSchedule(scheduleData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_id || !formData.title || !formData.scheduled_date || !formData.scheduled_time) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      const scheduled_date = `${formData.scheduled_date}T${formData.scheduled_time}:00`;
      await dashboardService.createSchedule({
        ...formData,
        scheduled_date
      });
      setModalOpen(false);
      setFormData({
        course_id: "",
        title: "",
        description: "",
        scheduled_date: "",
        scheduled_time: "",
        duration_minutes: 60,
        location: "",
        type: "lecture"
      });
      fetchData();
    } catch (err) {
      alert("Erreur lors de la création");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette session ?")) return;
    try {
      await dashboardService.deleteSchedule(id);
      setSchedule(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      alert("Erreur suppression");
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeLabel = (type) => {
    const types = {
      lecture: "Cours",
      lab: "TP",
      exam: "Examen",
      meeting: "Réunion"
    };
    return types[type] || type;
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
                className={`sidebar-nav-item ${item.id === "calendar" ? "active" : ""}`}
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
          <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h1 className="page-main-title">
                <HiCalendar style={{ display: "inline", marginRight: "0.5rem" }} />
                Planning des cours
              </h1>
              <p className="page-main-subtitle">Gérez vos sessions de cours programmées</p>
            </div>
            <button onClick={() => setModalOpen(true)} className="student-primary-btn">
              <HiPlus /> Nouvelle session
            </button>
          </div>

          {loading ? (
            <p className="text-center py-12 text-gray-500">Chargement...</p>
          ) : schedule.length === 0 ? (
            <div className="student-content-card text-center py-16">
              <HiCalendar className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">Aucune session programmée</p>
              <button onClick={() => setModalOpen(true)} className="mt-4 text-purple-600 font-medium underline">
                Planifier votre première session
              </button>
            </div>
          ) : (
            <div className="student-content-card">
              <div className="student-activity-list">
                {schedule.map((item) => (
                  <div key={item.id} className="student-activity-item" style={{ padding: "1.5rem" }}>
                    <div className={`event-type-badge ${item.type}`} style={{ width: "48px", height: "48px" }}>
                      <HiCalendar style={{ fontSize: "1.5rem" }} />
                    </div>
                    <div className="activity-item-details" style={{ flex: 1 }}>
                      <p className="activity-item-action" style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                        {item.course_title} - {item.title}
                      </p>
                      <p className="activity-item-course">
                        <span className="badge" style={{ 
                          background: "#e9d5ff", 
                          color: "#7c3aed", 
                          padding: "2px 8px", 
                          borderRadius: "4px",
                          fontSize: "0.75rem",
                          marginRight: "0.5rem"
                        }}>
                          {getTypeLabel(item.type)}
                        </span>
                        {item.description}
                      </p>
                      <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", color: "#6b7280", fontSize: "0.875rem" }}>
                        <span><HiClock style={{ display: "inline", marginRight: "4px" }} />{formatDate(item.scheduled_date)}</span>
                        <span><HiClock style={{ display: "inline", marginRight: "4px" }} />{item.duration_minutes} min</span>
                        {item.location && <span><HiLocationMarker style={{ display: "inline", marginRight: "4px" }} />{item.location}</span>}
                        <span><HiUserGroup style={{ display: "inline", marginRight: "4px" }} />{item.students_count || 0} étudiants</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDelete(item.id)}
                      className="course-action-btn course-delete-btn"
                      title="Supprimer"
                    >
                      <HiTrash />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          </div>
        </main>

        {/* FOOTER */}
        <Footer />

        {/* Modal création */}
        {modalOpen && (
          <>
            <div className="modal-overlay" onClick={() => setModalOpen(false)} />
            <div className="modal-container">
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2 className="modal-title">Nouvelle session</h2>
                  <button onClick={() => setModalOpen(false)} className="modal-close-btn"><HiX /></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="modal-form-group">
                      <label className="modal-label">Cours <span className="text-red-500">*</span></label>
                      <select
                        value={formData.course_id}
                        onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                        className="modal-input"
                        required
                      >
                        <option value="">Sélectionner un cours</option>
                        {courses.map(c => (
                          <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="modal-form-group">
                      <label className="modal-label">Titre de la session <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="modal-input"
                        placeholder="Ex: Module 5 - Introduction aux APIs"
                        required
                      />
                    </div>
                    <div className="modal-form-group">
                      <label className="modal-label">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="modal-textarea"
                        rows={2}
                        placeholder="Description optionnelle..."
                      />
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="modal-form-group">
                        <label className="modal-label">Date <span className="text-red-500">*</span></label>
                        <input
                          type="date"
                          value={formData.scheduled_date}
                          onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                          className="modal-input"
                          required
                        />
                      </div>
                      <div className="modal-form-group">
                        <label className="modal-label">Heure <span className="text-red-500">*</span></label>
                        <input
                          type="time"
                          value={formData.scheduled_time}
                          onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                          className="modal-input"
                          required
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      <div className="modal-form-group">
                        <label className="modal-label">Durée (minutes)</label>
                        <input
                          type="number"
                          value={formData.duration_minutes}
                          onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                          className="modal-input"
                          min="15"
                          step="15"
                        />
                      </div>
                      <div className="modal-form-group">
                        <label className="modal-label">Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="modal-input"
                        >
                          <option value="lecture">Cours</option>
                          <option value="lab">TP</option>
                          <option value="exam">Examen</option>
                          <option value="meeting">Réunion</option>
                        </select>
                      </div>
                    </div>
                    <div className="modal-form-group">
                      <label className="modal-label">Lieu</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="modal-input"
                        placeholder="Ex: Salle A102, En ligne..."
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" onClick={() => setModalOpen(false)} className="modal-btn modal-btn-cancel">Annuler</button>
                    <button type="submit" className="modal-btn modal-btn-save">Créer la session</button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
