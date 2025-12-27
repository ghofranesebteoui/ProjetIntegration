import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiUser, HiMail, HiPhone, HiLocationMarker, HiCalendar,
  HiAcademicCap, HiBriefcase, HiClock, HiCheckCircle,
  HiCamera, HiTrash, HiPencil, HiX, HiCheck,
  HiExclamationCircle, HiLockClosed, HiMenu,
  HiHome, HiBookOpen, HiClipboardList, HiChatAlt2,
  HiLogout, HiChartBar, HiDocumentText
} from "react-icons/hi";
import Footer from "../../components/Footer";
import NotificationDropdown from "../../components/NotificationDropdown";
import "./TeacherProfile.css";
import "./TeacherDashboard.css";

export default function TeacherProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const [formData, setFormData] = useState({
    first_name: "", 
    last_name: "", 
    email: "", 
    phone: "", 
    address: "",
    age: "", 
    specialty: "", 
    years_experience: "",
    profile_image: null
  });

  const [errors, setErrors] = useState({});
  const [passwordData, setPasswordData] = useState({
    current_password: "", new_password: "", new_password_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const teacherMenuItems = [
    { id: "home", label: "Accueil", icon: HiHome, path: "/enseignant/dashboard" },
    { id: "courses", label: "Mes Cours", icon: HiBookOpen, path: "/courses" },
    { id: "assignments", label: "Quiz", icon: HiClipboardList, path: "/enseignant/assignments" },
    { id: "calendar", label: "Planning", icon: HiCalendar, path: "/enseignant/planning" },
    { id: "messaging", label: "Messagerie", icon: HiChatAlt2, path: "/enseignant/messaging" },
    { id: "statistics", label: "Statistiques", icon: HiChartBar, path: "/enseignant/statistics" },
    { id: "resources", label: "Ressources", icon: HiDocumentText, path: "/enseignant/resources" },
  ];

  // --- CHARGEMENT DU PROFIL ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        // Récupérer les données du localStorage comme fallback
        const storedUser = localStorage.getItem("user");
        let localUserData = null;
        if (storedUser) {
          try {
            localUserData = JSON.parse(storedUser);
          } catch (e) {
            console.error("Erreur parsing localStorage user:", e);
          }
        }

        const res = await fetch("http://localhost:5000/api/profile/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();
        console.log("Données reçues du serveur:", data);
        console.log("Données localStorage:", localUserData);

        if (!res.ok) {
          console.error("Erreur serveur :", data);
          alert(data.error || data.msg || "Impossible de charger le profil");
          return;
        }

        // Utiliser les données du serveur, avec fallback sur localStorage
        const mergedData = {
          ...data,
          first_name: data.first_name || localUserData?.first_name || "",
          last_name: data.last_name || localUserData?.last_name || "",
        };

        setUser(mergedData);
        setFormData({
          first_name: mergedData.first_name,
          last_name: mergedData.last_name,
          email: mergedData.email || "",
          phone: mergedData.phone || "",
          address: mergedData.address || "",
          age: mergedData.age || "",
          specialty: mergedData.specialty || "",
          years_experience: mergedData.years_experience || "",
        });
        if (mergedData.profile_image) setProfileImage(mergedData.profile_image);
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement du profil");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

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

  // --- VALIDATIONS ---
  const validatePhone = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const regex = /^\+216[0-9]{8}$/;
    if (value && !regex.test(cleaned)) return "Numéro invalide : +216 suivi de 8 chiffres";
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
      case "last_name":
        if (!value.trim()) return "Ce champ est obligatoire";
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value)) return "Lettres uniquement";
        break;
      case "phone": return validatePhone(value);
      case "age":
        if (value && (value < 22 || value > 70)) return "Âge entre 22 et 70 ans";
        // Vérifier la cohérence avec les années d'expérience
        if (value && formData.years_experience) {
          const minAge = parseInt(formData.years_experience) + 22; // Âge minimum = expérience + 22 ans
          if (parseInt(value) < minAge) {
            return `Âge incohérent : avec ${formData.years_experience} ans d'expérience, l'âge minimum est ${minAge} ans`;
          }
        }
        break;
      case "years_experience":
        if (value !== "" && (value < 0 || value > 40)) return "Max 40 ans";
        // Vérifier la cohérence avec l'âge
        if (value && formData.age) {
          const maxExperience = parseInt(formData.age) - 22; // Expérience max = âge - 22 ans
          if (parseInt(value) > maxExperience) {
            return `Expérience incohérente : avec ${formData.age} ans, l'expérience maximum est ${maxExperience} ans`;
          }
        }
        break;
      case "specialty":
        if (!value.trim()) return "Ce champ est obligatoire";
        break;
      default: break;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Valider le champ modifié
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
    
    // Si on modifie l'âge ou les années d'expérience, revalider l'autre champ
    if (name === "age" && formData.years_experience) {
      const expError = validateField("years_experience", formData.years_experience);
      setErrors(prev => ({ ...prev, years_experience: expError }));
    }
    if (name === "years_experience" && formData.age) {
      const ageError = validateField("age", formData.age);
      setErrors(prev => ({ ...prev, age: ageError }));
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: "", submit: "" }));
  };

  // --- SAUVEGARDE DU PROFIL ---
  const handleSave = async () => {
    const newErrors = {};
    ["first_name", "last_name", "specialty"].forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    if (formData.phone) {
      const err = validatePhone(formData.phone);
      if (err) newErrors.phone = err;
    }
    
    // Valider l'âge et les années d'expérience
    if (formData.age) {
      const ageErr = validateField("age", formData.age);
      if (ageErr) newErrors.age = ageErr;
    }
    if (formData.years_experience) {
      const expErr = validateField("years_experience", formData.years_experience);
      if (expErr) newErrors.years_experience = expErr;
    }
    
    // Vérification supplémentaire de cohérence
    if (formData.age && formData.years_experience) {
      const age = parseInt(formData.age);
      const experience = parseInt(formData.years_experience);
      const minAge = experience + 22;
      
      if (age < minAge) {
        newErrors.age = `Incohérent : avec ${experience} ans d'expérience, l'âge minimum est ${minAge} ans`;
        newErrors.years_experience = `Incohérent : avec ${age} ans, l'expérience maximum est ${age - 22} ans`;
      }
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Veuillez corriger les erreurs avant de sauvegarder");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Inclure l'image de profil dans les données à sauvegarder
      const dataToSave = {
        ...formData,
        profile_image: profileImage // Ajouter l'image
      };
      
      const res = await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(dataToSave)
      });

      const updated = await res.json();
      console.log("Données après sauvegarde:", updated);
      if (!res.ok) throw new Error(updated.error || "Erreur mise à jour");

      const updatedUser = updated.user || updated;
      console.log("updatedUser:", updatedUser);
      
      // Mettre à jour user et formData avec les données du serveur
      // Utiliser les valeurs actuelles comme fallback si le serveur renvoie des valeurs vides
      const newUserData = {
        first_name: updatedUser.first_name || formData.first_name || "",
        last_name: updatedUser.last_name || formData.last_name || "",
        email: updatedUser.email || formData.email || "",
        phone: updatedUser.phone || formData.phone || "",
        address: updatedUser.address || formData.address || "",
        age: updatedUser.age || formData.age || "",
        specialty: updatedUser.specialty || formData.specialty || "",
        years_experience: updatedUser.years_experience || formData.years_experience || "",
      };
      
      setUser(newUserData);
      setFormData(newUserData);
      
      // Conserver l'image de profil
      if (updatedUser.profile_image) {
        setProfileImage(updatedUser.profile_image);
      }
      
      setIsEditing(false);
      setErrors({});
      alert("Profil mis à jour avec succès !");
    } catch (err) {
      alert(err.message);
    }
  };

  // --- CHANGEMENT DE MOT DE PASSE ---
  const handlePasswordSubmit = async () => {
    const newErrors = {};
    if (!passwordData.current_password) newErrors.current_password = "Mot de passe actuel requis";
    if (!passwordData.new_password) newErrors.new_password = "Nouveau mot de passe requis";
    else if (passwordData.new_password.length < 8) newErrors.new_password = "Minimum 8 caractères";
    if (passwordData.new_password !== passwordData.new_password_confirmation)
      newErrors.new_password_confirmation = "Les mots de passe ne correspondent pas";

    if (Object.keys(newErrors).length > 0) {
      setPasswordErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/profile/me/password", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ current_password: passwordData.current_password, new_password: passwordData.new_password })
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Erreur lors de la modification du mot de passe");

      setPasswordSuccess(true);
      setPasswordData({ current_password: "", new_password: "", new_password_confirmation: "" });
      setPasswordErrors({});
      alert("Mot de passe changé avec succès !");
    } catch (err) {
      setPasswordErrors({ submit: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // --- UPLOAD PHOTO ---
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setProfileImage(base64);
      try {
        const token = localStorage.getItem("token");
        await fetch("http://localhost:5000/api/profile/me/avatar", {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ profile_image: base64 })
        });
      } catch {
        alert("Erreur lors de l'upload de la photo");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async (e) => {
    e.stopPropagation();
    setProfileImage(null);
    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ profile_image: null })
      });
    } catch (err) { console.error(err); }
  };

  if (!user) {
    return (
      <div className="loading-profile">
        <HiAcademicCap className="spinner" />
        <p>Chargement du profil...</p>
      </div>
    );
  }

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
          <div className="teacher-profile-content">
            {/* HERO SECTION */}
            <div className="profile-hero-section">
              <div className="profile-avatar-container" onClick={() => fileInputRef.current?.click()}>
                {profileImage ? (
                  <img src={profileImage} alt="Profil" className="profile-avatar-img" />
                ) : (
                  <div className="profile-avatar-default"><HiUser /></div>
                )}
                <div className="avatar-overlay">
                  <HiCamera /><span>Changer</span>
                </div>
                {profileImage && (
                  <button className="delete-avatar-btn" onClick={handleRemoveImage}>
                    <HiTrash />
                  </button>
                )}
              </div>

              <div className="profile-info-header">
                <h1>{formData.first_name} {formData.last_name}</h1>
                <p className="role-badge">
                  <HiAcademicCap /> Enseignant
                </p>
                <div className="quick-stats">
                  <div className="stat-item">
                    <HiClock />
                    <span>{formData.years_experience || "0"} ans d'expérience</span>
                  </div>
                  <div className="stat-item">
                    <HiBriefcase />
                    <span>{formData.specialty || "Non défini"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ONGLETS */}
            <div className="tabs-container">
              <button 
                className={`tab-button ${activeTab === "personal" ? "active" : ""}`} 
                onClick={() => setActiveTab("personal")}
              >
                <HiUser className="tab-icon" /> Informations personnelles
              </button>
              <button 
                className={`tab-button ${activeTab === "security" ? "active" : ""}`} 
                onClick={() => setActiveTab("security")}
              >
                <HiLockClosed className="tab-icon" /> Sécurité
              </button>
            </div>

            {/* ONGLET : Informations personnelles */}
            {activeTab === "personal" && (
              <div className="profile-card">
                <div className="card-header">
                  <h2>Informations personnelles</h2>
                  {isEditing ? (
                    <div className="edit-actions">
                      <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                        <HiX /> Annuler
                      </button>
                      <button className="btn-save" onClick={handleSave}>
                        <HiCheck /> Enregistrer
                      </button>
                    </div>
                  ) : (
                    <button className="btn-edit" onClick={() => setIsEditing(true)}>
                      <HiPencil /> Modifier
                    </button>
                  )}
                </div>

                <div className="info-grid">
                  {/* Prénom */}
                  <div className="info-row">
                    <div className="info-label">
                      <HiUser /> Prénom <span className="required">*</span>
                    </div>
                    <div className="info-value">
                      {isEditing ? (
                        <div className="input-wrapper">
                          <input 
                            name="first_name" 
                            value={formData.first_name} 
                            onChange={handleChange} 
                            className={errors.first_name ? "error" : ""} 
                            placeholder="Entrez votre prénom"
                          />
                          {errors.first_name && (
                            <span className="error-msg">
                              <HiExclamationCircle /> {errors.first_name}
                            </span>
                          )}
                        </div>
                      ) : (formData.first_name || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>À remplir</span>)}
                    </div>
                  </div>

                  {/* Nom */}
                  <div className="info-row">
                    <div className="info-label">
                      <HiUser /> Nom <span className="required">*</span>
                    </div>
                    <div className="info-value">
                      {isEditing ? (
                        <div className="input-wrapper">
                          <input 
                            name="last_name" 
                            value={formData.last_name} 
                            onChange={handleChange} 
                            className={errors.last_name ? "error" : ""} 
                            placeholder="Entrez votre nom"
                          />
                          {errors.last_name && (
                            <span className="error-msg">
                              <HiExclamationCircle /> {errors.last_name}
                            </span>
                          )}
                        </div>
                      ) : (formData.last_name || <span style={{ color: "#9ca3af", fontStyle: "italic" }}>À remplir</span>)}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="info-row">
                    <div className="info-label">
                      <HiMail /> Email
                    </div>
                    <div className="info-value verified">
                      {user.email}
                      <span className="verified-badge">
                        <HiCheckCircle /> Vérifié
                      </span>
                    </div>
                  </div>

                  {/* Téléphone */}
                  <div className="info-row">
                    <div className="info-label">
                      <HiPhone /> Téléphone
                    </div>
                    <div className="info-value">
                      {isEditing ? (
                        <div className="input-wrapper">
                          <input 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            placeholder="+216 22 345 678" 
                            className={errors.phone ? "error" : ""} 
                            maxLength="16" 
                          />
                          {errors.phone && (
                            <span className="error-msg">
                              <HiExclamationCircle /> {errors.phone}
                            </span>
                          )}
                        </div>
                      ) : (formData.phone || "Non renseigné")}
                    </div>
                  </div>

                  {/* Âge */}
                  <div className="info-row">
                    <div className="info-label">
                      <HiCalendar /> Âge
                    </div>
                    <div className="info-value">
                      {isEditing ? (
                        <div className="input-wrapper">
                          <input 
                            type="number" 
                            name="age" 
                            value={formData.age} 
                            onChange={handleChange} 
                            placeholder="Ex: 38" 
                            min="22" 
                            max="70" 
                            className={errors.age ? "error" : ""} 
                          />
                          {errors.age ? (
                            <span className="error-msg">
                              <HiExclamationCircle /> {errors.age}
                            </span>
                          ) : formData.years_experience && (
                            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                              💡 Avec {formData.years_experience} ans d'expérience, l'âge minimum est {parseInt(formData.years_experience) + 22} ans
                            </span>
                          )}
                        </div>
                      ) : formData.age ? `${formData.age} ans` : "Non renseigné"}
                    </div>
                  </div>

                  {/* Adresse */}
                  <div className="info-row">
                    <div className="info-label">
                      <HiLocationMarker /> Adresse
                    </div>
                    <div className="info-value">
                      {isEditing ? (
                        <input 
                          name="address" 
                          value={formData.address} 
                          onChange={handleChange} 
                          placeholder="Tunis, Tunisie" 
                        />
                      ) : (formData.address || "Non renseignée")}
                    </div>
                  </div>

                  {/* Spécialité */}
                  <div className="info-row full">
                    <div className="info-label">
                      <HiBriefcase /> Spécialité <span className="required">*</span>
                    </div>
                    <div className="info-value highlight">
                      {isEditing ? (
                        <div className="input-wrapper">
                          <input 
                            name="specialty" 
                            value={formData.specialty} 
                            onChange={handleChange} 
                            className={errors.specialty ? "error" : ""} 
                          />
                          {errors.specialty && (
                            <span className="error-msg">
                              <HiExclamationCircle /> {errors.specialty}
                            </span>
                          )}
                        </div>
                      ) : formData.specialty}
                    </div>
                  </div>

                  {/* Années d'expérience */}
                  <div className="info-row full">
                    <div className="info-label">
                      <HiClock /> Années d'expérience
                    </div>
                    <div className="info-value">
                      {isEditing ? (
                        <div className="input-wrapper">
                          <input 
                            type="number" 
                            name="years_experience" 
                            value={formData.years_experience} 
                            onChange={handleChange} 
                            min="0" 
                            max="40" 
                            placeholder="Ex: 10"
                            className={errors.years_experience ? "error" : ""} 
                          />
                          {errors.years_experience ? (
                            <span className="error-msg">
                              <HiExclamationCircle /> {errors.years_experience}
                            </span>
                          ) : formData.age && (
                            <span style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem', display: 'block' }}>
                              💡 Avec {formData.age} ans, l'expérience maximum est {parseInt(formData.age) - 22} ans
                            </span>
                          )}
                        </div>
                      ) : formData.years_experience ? `${formData.years_experience} ans` : "Non renseigné"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ONGLET : Sécurité */}
            {activeTab === "security" && (
              <div className="profile-card">
                <div className="card-header">
                  <h2>Changement de mot de passe</h2>
                </div>
                <div className="password-section">
                  {passwordSuccess && (
                    <div className="success-message">
                      <HiCheckCircle /> Mot de passe modifié avec succès !
                    </div>
                  )}
                  {passwordErrors.submit && (
                    <div className="error-message">
                      <HiExclamationCircle /> {passwordErrors.submit}
                    </div>
                  )}

                  {["current", "new", "confirm"].map((field, idx) => {
                    const label = field === "current" ? "Mot de passe actuel" :
                                  field === "new" ? "Nouveau mot de passe" :
                                  "Confirmer le nouveau mot de passe";
                    const name = field === "current" ? "current_password" :
                                 field === "new" ? "new_password" :
                                 "new_password_confirmation";
                    const error = passwordErrors[name];
                    return (
                      <div className="password-field" key={idx}>
                        <label>{label} <span className="required">*</span></label>
                        <div className="input-with-icon">
                          <input
                            type={showPassword[field] ? "text" : "password"}
                            name={name}
                            value={passwordData[name]}
                            onChange={handlePasswordChange}
                            className={error ? "error" : ""}
                            placeholder={field === "confirm" ? "Retapez le mot de passe" : "••••••••"}
                          />
                          <button
                            type="button"
                            className="toggle-visibility"
                            onClick={() => setShowPassword(prev => ({ ...prev, [field]: !prev[field] }))}
                          >
                            {showPassword[field] ? "🙈" : "👁️"}
                          </button>
                        </div>
                        {error && (
                          <span className="error-msg">
                            <HiExclamationCircle /> {error}
                          </span>
                        )}
                      </div>
                    )
                  })}

                  <button className="btn-save" onClick={handlePasswordSubmit} disabled={isLoading}>
                    {isLoading ? "Mise à jour en cours..." : "Mettre à jour le mot de passe"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>

      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleImageUpload} 
        style={{ display: "none" }} 
      />
    </div>
  );
}
