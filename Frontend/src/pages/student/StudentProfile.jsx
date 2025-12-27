import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HiUser, HiMail, HiPhone, HiLocationMarker, HiCalendar,
  HiAcademicCap, HiBriefcase, HiClock, HiCheckCircle,
  HiCamera, HiTrash, HiArrowLeft, HiPencil, HiX, HiCheck,
  HiExclamationCircle, HiLockClosed
} from "react-icons/hi";
import "./StudentProfile.css";

export default function StudentProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  const [formData, setFormData] = useState({
    first_name: "", 
    last_name: "", 
    email: "", 
    phone: "", 
    address: "",
    age: "", 
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

  // --- CHARGEMENT DU PROFIL ---
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("http://localhost:5000/api/profile/me", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Erreur serveur :", data);
          alert(data.error || data.msg || "Impossible de charger le profil");
          return;
        }

        setUser(data);
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          age: data.age || "",
        });
        if (data.profile_image) setProfileImage(data.profile_image);
      } catch (err) {
        console.error(err);
        alert("Erreur lors du chargement du profil");
        navigate("/login");
      }
    };

    fetchProfile();
  }, [navigate]);

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
        if (value && (value < 16 || value > 70)) return "Âge entre 16 et 70 ans";
        break;
      default: break;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordErrors(prev => ({ ...prev, [name]: "", submit: "" }));
  };

  // --- SAUVEGARDE DU PROFIL ---
  const handleSave = async () => {
    const newErrors = {};
    ["first_name", "last_name"].forEach(field => {
      const err = validateField(field, formData[field]);
      if (err) newErrors[field] = err;
    });
    if (formData.phone) {
      const err = validatePhone(formData.phone);
      if (err) newErrors.phone = err;
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/profile/me", {
        method: "PUT",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || "Erreur mise à jour");

      setUser(updated.user || updated);
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
    <div className="student-profile-wrapper">
      <div className="profile-header-bar">
        <Link to="/dashboard" className="logo-link">
          <div className="logo">
            <div className="edunova-icon"><HiAcademicCap /></div>
            <span className="edunova-text">eduNova</span>
          </div>
        </Link>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Retour
        </button>
      </div>

      <div className="profile-hero">
        <div className="profile-avatar-container" onClick={() => fileInputRef.current?.click()}>
          {profileImage ? (
            <img src={profileImage} alt="Profil" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-default"><HiUser /></div>
          )}
          <div className="avatar-overlay">
            <HiCamera /><span>Changer la photo</span>
          </div>
          {profileImage && (
            <button className="delete-avatar-btn" onClick={handleRemoveImage}>
              <HiTrash />
            </button>
          )}
        </div>

        <div className="profile-info-header">
          <h1>{user.first_name} {user.last_name}</h1>
          <p className="role">Étudiant</p>
        </div>
      </div>

      <div className="profile-content">
        <div className="tabs-container">
          <button className={`tab-button ${activeTab === "personal" ? "active" : ""}`} onClick={() => setActiveTab("personal")}>
            <HiUser className="tab-icon" /> Informations personnelles
          </button>
          <button className={`tab-button ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>
            <HiLockClosed className="tab-icon" /> Sécurité du compte
          </button>
        </div>

        {activeTab === "personal" && (
          <div className="profile-card">
            <div className="card-header">
              <h2>Informations personnelles</h2>
              {isEditing ? (
                <div className="edit-actions">
                  <button className="btn-cancel" onClick={() => setIsEditing(false)}><HiX /> Annuler</button>
                  <button className="btn-save" onClick={handleSave}><HiCheck /> Enregistrer</button>
                </div>
              ) : (
                <button className="btn-edit" onClick={() => setIsEditing(true)}><HiPencil /> Modifier</button>
              )}
            </div>

            <div className="info-grid">
              <div className="info-row">
                <div className="info-label"><HiUser /> Prénom <span className="required">*</span></div>
                <div className="info-value">
                  {isEditing ? (
                    <div className="input-wrapper">
                      <input name="first_name" value={formData.first_name} onChange={handleChange} className={errors.first_name ? "error" : ""} />
                      {errors.first_name && <span className="error-msg"><HiExclamationCircle /> {errors.first_name}</span>}
                    </div>
                  ) : user.first_name}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><HiUser /> Nom <span className="required">*</span></div>
                <div className="info-value">
                  {isEditing ? (
                    <div className="input-wrapper">
                      <input name="last_name" value={formData.last_name} onChange={handleChange} className={errors.last_name ? "error" : ""} />
                      {errors.last_name && <span className="error-msg"><HiExclamationCircle /> {errors.last_name}</span>}
                    </div>
                  ) : user.last_name}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><HiMail /> Email</div>
                <div className="info-value verified">
                  {user.email}
                  <span className="verified-badge"><HiCheckCircle /> Vérifié</span>
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><HiPhone /> Téléphone</div>
                <div className="info-value">
                  {isEditing ? (
                    <div className="input-wrapper">
                      <input name="phone" value={formData.phone} onChange={handleChange} placeholder="+216 22 345 678" className={errors.phone ? "error" : ""} maxLength="16" />
                      {errors.phone && <span className="error-msg"><HiExclamationCircle /> {errors.phone}</span>}
                    </div>
                  ) : (formData.phone || "Non renseigné")}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><HiCalendar /> Âge</div>
                <div className="info-value">
                  {isEditing ? (
                    <div className="input-wrapper">
                      <input type="number" name="age" value={formData.age} onChange={handleChange} placeholder="Ex: 20" min="16" max="70" className={errors.age ? "error" : ""} />
                      {errors.age && <span className="error-msg"><HiExclamationCircle /> {errors.age}</span>}
                    </div>
                  ) : formData.age ? `${formData.age} ans` : "Non renseigné"}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label"><HiLocationMarker /> Adresse</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="address" value={formData.address} onChange={handleChange} placeholder="Tunis, Tunisie" />
                  ) : (formData.address || "Non renseignée")}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "security" && (
          <div className="profile-card">
            <div className="card-header">
              <h2>Changement de mot de passe</h2>
            </div>
            <div className="password-section">
              {passwordSuccess && <div className="success-message"><HiCheckCircle /> Mot de passe modifié avec succès !</div>}
              {passwordErrors.submit && <div className="error-message"><HiExclamationCircle /> {passwordErrors.submit}</div>}

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
                    {error && <span className="error-msg"><HiExclamationCircle /> {error}</span>}
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

      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
    </div>
  );
}
