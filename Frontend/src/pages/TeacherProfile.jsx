import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  HiUser,
  HiMail,
  HiPhone,
  HiLocationMarker,
  HiCalendar,
  HiAcademicCap,
  HiBriefcase,
  HiClock,
  HiCheckCircle,
  HiCamera,
  HiTrash,
  HiArrowLeft,
  HiPencil,
  HiX,
  HiCheck,
  HiExclamationCircle,
} from "react-icons/hi";
import "./TeacherProfile.css";

export default function TeacherProfile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    age: "",
    department: "",
    specialty: "",
    years_experience: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setFormData({
        first_name: parsed.first_name || "",
        last_name: parsed.last_name || "",
        email: parsed.email || "",
        phone: parsed.phone || "",
        address: parsed.address || "",
        age: parsed.age || "",
        department: parsed.department || "Informatique",
        specialty: parsed.specialty || "Développement Web",
        years_experience: parsed.years_experience || "",
      });
      if (parsed.profileImage) setProfileImage(parsed.profileImage);
    }
  }, []);

  // Validation téléphone tunisien : +216 + exactement 8 chiffres
  const validatePhone = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const regex = /^\+216[0-9]{8}$/;
    if (value && !regex.test(cleaned)) {
      return "Numéro invalide : +216 suivi de 8 chiffres exactement (ex: +216 22 345 678)";
    }
    return "";
  };

  const validateField = (name, value) => {
    switch (name) {
      case "first_name":
      case "last_name":
        if (!value.trim()) return "Ce champ est obligatoire";
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(value))
          return "Seules les lettres, espaces et tirets sont autorisés";
        break;

      case "phone":
        return validatePhone(value);

      case "age":
        if (value && (value < 22 || value > 70))
          return "L'âge doit être entre 22 et 70 ans";
        break;

      case "years_experience":
        if (value !== "" && (value < 0 || value > 40))
          return "Entre 0 et 40 ans maximum";
        break;

      case "department":
      case "specialty":
        if (!value.trim()) return "Ce champ est obligatoire";
        break;

      default:
        break;
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Formatage automatique du téléphone
    if (name === "phone") {
      let digits = value.replace(/[^\d+]/g, "");
      if (digits.startsWith("+216") && digits.length > 4) {
        const num = digits.slice(4);
        if (num.length <= 8) {
          formattedValue = "+216 " + num.match(/.{1,2}/g)?.join(" ") || "+216 ";
        }
      } else if (!digits.startsWith("+216")) {
        formattedValue = "+216 ";
      }
    }

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    const error = validateField(name, formattedValue);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result;
        setProfileImage(base64);
        const updated = { ...user, profileImage: base64 };
        localStorage.setItem("user", JSON.stringify(updated));
        setUser(updated);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setProfileImage(null);
    const updated = { ...user };
    delete updated.profileImage;
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  const handleSave = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const updated = { ...user, ...formData, profileImage };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
    setIsEditing(false);
    setErrors({});
    alert("Profil mis à jour avec succès !");
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
    <div className="teacher-profile-wrapper">
      {/* HEADER */}
      <div className="profile-header-bar">
        <Link to="/dashboard" className="logo-link">
          <div className="logo">
            <div className="edunova-icon">
              <HiAcademicCap />
            </div>
            <span className="edunova-text">eduNova</span>
          </div>
        </Link>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <HiArrowLeft /> Retour
        </button>
      </div>

      {/* HERO */}
      <div className="profile-hero">
        <div
          className="profile-avatar-container"
          onClick={() => fileInputRef.current?.click()}
        >
          {profileImage ? (
            <img src={profileImage} alt="Profil" className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-default">
              <HiUser />
            </div>
          )}
          <div className="avatar-overlay">
            <HiCamera />
            <span>Changer la photo</span>
          </div>
          {profileImage && (
            <button className="delete-avatar-btn" onClick={handleRemoveImage}>
              <HiTrash />
            </button>
          )}
        </div>

        <div className="profile-info-header">
          <h1>{user.first_name} {user.last_name}</h1>
          <p className="role">Enseignant • {formData.department}</p>
          <div className="quick-stats">
            <div className="stat-item">
              <HiAcademicCap />
              <span>{formData.years_experience || "0"} ans d'expérience</span>
            </div>
            <div className="stat-item">
              <HiBriefcase />
              <span>{formData.specialty || "Non défini"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="profile-content">
        <div className="profile-card">
          <div className="card-header">
            <h2>Informations Personnelles</h2>
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
              <div className="info-label"><HiUser /> Prénom <span className="required">*</span></div>
              <div className="info-value">
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={errors.first_name ? "error" : ""}
                    />
                    {errors.first_name && <span className="error-msg"><HiExclamationCircle /> {errors.first_name}</span>}
                  </div>
                ) : user.first_name}
              </div>
            </div>

            {/* Nom */}
            <div className="info-row">
              <div className="info-label"><HiUser /> Nom <span className="required">*</span></div>
              <div className="info-value">
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={errors.last_name ? "error" : ""}
                    />
                    {errors.last_name && <span className="error-msg"><HiExclamationCircle /> {errors.last_name}</span>}
                  </div>
                ) : user.last_name}
              </div>
            </div>

            {/* Email */}
            <div className="info-row">
              <div className="info-label"><HiMail /> Email</div>
              <div className="info-value verified">
                {user.email}
                <span className="verified-badge"><HiCheckCircle /> Vérifié</span>
              </div>
            </div>

            {/* Téléphone - 8 chiffres obligatoires après +216 */}
            <div className="info-row">
              <div className="info-label"><HiPhone /> Téléphone</div>
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
                    {errors.phone && <span className="error-msg"><HiExclamationCircle /> {errors.phone}</span>}
                  </div>
                ) : (formData.phone || "Non renseigné")}
              </div>
            </div>

            {/* Âge */}
            <div className="info-row">
              <div className="info-label"><HiCalendar /> Âge</div>
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
                    {errors.age && <span className="error-msg"><HiExclamationCircle /> {errors.age}</span>}
                  </div>
                ) : formData.age ? `${formData.age} ans` : "Non renseigné"}
              </div>
            </div>

            {/* Adresse */}
            <div className="info-row">
              <div className="info-label"><HiLocationMarker /> Adresse</div>
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

            {/* Département */}
            <div className="info-row full">
              <div className="info-label"><HiAcademicCap /> Département <span className="required">*</span></div>
              <div className="info-value highlight">
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className={errors.department ? "error" : ""}
                    />
                    {errors.department && <span className="error-msg"><HiExclamationCircle /> {errors.department}</span>}
                  </div>
                ) : formData.department}
              </div>
            </div>

            {/* Spécialité */}
            <div className="info-row full">
              <div className="info-label"><HiBriefcase /> Spécialité <span className="required">*</span></div>
              <div className="info-value highlight">
                {isEditing ? (
                  <div className="input-wrapper">
                    <input
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleChange}
                      className={errors.specialty ? "error" : ""}
                    />
                    {errors.specialty && <span className="error-msg"><HiExclamationCircle /> {errors.specialty}</span>}
                  </div>
                ) : formData.specialty}
              </div>
            </div>

            {/* Années d'expérience */}
            <div className="info-row full">
              <div className="info-label"><HiClock /> Années d'expérience</div>
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
                      className={errors.years_experience ? "error" : ""}
                    />
                    {errors.years_experience && <span className="error-msg"><HiExclamationCircle /> {errors.years_experience}</span>}
                  </div>
                ) : formData.years_experience ? `${formData.years_experience} ans` : "Non renseigné"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Input caché pour l'upload */}
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