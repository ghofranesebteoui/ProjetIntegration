import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiTrash,
  HiUpload,
  HiLink,
  HiDocumentText,
  HiVideoCamera,
  HiPhotograph,
  HiFolder,
  HiX,
  HiExternalLink,
  HiDownload,
  HiEye,
  HiAcademicCap,
  HiClock,
  HiUser,
  HiSearch,
  HiBell,
} from "react-icons/hi";
import { courseService } from "../../services/courseService";
import Footer from "../../components/Footer";
import "./TeacherCourseDetail.css";

const API_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || "http://localhost:5000";

export default function TeacherCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await courseService.getById(id);
      setCourse(data);
    } catch (err) {
      console.error("Erreur chargement cours:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of files) {
        await courseService.uploadContent(id, file, file.name);
      }
      await loadCourse();
    } catch (err) {
      alert("Erreur lors de l'upload: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddLink = async () => {
    if (!linkUrl.trim()) {
      alert("Veuillez entrer une URL");
      return;
    }

    try {
      await courseService.addLink(id, linkUrl, linkTitle);
      setShowLinkModal(false);
      setLinkUrl("");
      setLinkTitle("");
      await loadCourse();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const handleDeleteContent = async (contentId, e) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer ce contenu ?")) return;
    
    try {
      await courseService.deleteContent(id, contentId);
      await loadCourse();
    } catch (err) {
      alert("Erreur: " + err.message);
    }
  };

  const getContentIcon = (type) => {
    switch (type) {
      case "pdf": return <HiDocumentText />;
      case "video": return <HiVideoCamera />;
      case "image": return <HiPhotograph />;
      case "link": return <HiLink />;
      default: return <HiFolder />;
    }
  };

  const getContentColor = (type) => {
    switch (type) {
      case "pdf": return "content-icon-pdf";
      case "video": return "content-icon-video";
      case "image": return "content-icon-image";
      case "link": return "content-icon-link";
      default: return "content-icon-file";
    }
  };

  const getFileUrl = (content) => {
    if (content.url) return content.url;
    if (content.file_path) {
      const url = `${API_URL}/uploads/${content.file_path}`;
      return url;
    }
    return null;
  };

  const getYouTubeEmbedUrl = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    return null;
  };

  const handleContentClick = (content) => {
    const url = getFileUrl(content);
    if (!url) return;
    
    // Ouvrir directement dans un nouvel onglet
    window.open(url, '_blank');
  };

  const handleDownload = (content, e) => {
    e.stopPropagation();
    const url = getFileUrl(content);
    if (!url) return;
    
    const link = document.createElement("a");
    link.href = url;
    link.download = content.file_name || "fichier";
    link.click();
  };

  const getInitials = () => {
    if (!user) return "EN";
    return `${(user.first_name || "").charAt(0)}${(user.last_name || "").charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="course-detail-wrapper">
        <div className="course-detail-loading">
          <div className="loading-spinner"></div>
          <p>Chargement du cours...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="course-detail-wrapper">
        <div className="course-detail-error">
          <HiFolder className="error-icon" />
          <h2>Oups !</h2>
          <p>{error || "Cours non trouvé"}</p>
          <button onClick={() => navigate("/enseignant")} className="btn-back-error">
            <HiArrowLeft /> Retour au dashboard
          </button>
        </div>
      </div>
    );
  }

  const contents = course.contents || [];

  return (
    <div className="course-detail-wrapper">
      {/* Header */}
      <header className="course-detail-header">
        <div className="header-container">
          <div className="header-left">
            <div className="logo" onClick={() => navigate("/enseignant")} style={{ cursor: "pointer" }}>
              <div className="logo-icon"><HiAcademicCap /></div>
              <span className="logo-text">eduNova</span>
            </div>
          </div>
          
          <div className="header-center">
            <div className="header-breadcrumb">
              <span onClick={() => navigate("/enseignant")} className="breadcrumb-link">Mes cours</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{course.title}</span>
            </div>
          </div>

          
        </div>
      </header>

      <main className="course-detail-main">
        {/* Hero Section */}
        <section className="course-hero">
          <div className="course-hero-content">
            <div className="course-hero-badge">
              <HiFolder /> Cours
            </div>
            <h1 className="course-hero-title">{course.title}</h1>
            <p className="course-hero-description">
              {course.description || "Aucune description disponible pour ce cours."}
            </p>
            <div className="course-hero-meta">
              <span className="meta-item">
                <HiUser /> {course.first_name} {course.last_name}
              </span>
              <span className="meta-item">
                <HiClock /> {new Date(course.createdAt).toLocaleDateString("fr-FR")}
              </span>
              <span className="meta-item">
                <HiDocumentText /> {contents.length} contenu{contents.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="course-hero-actions">
              <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="btn-hero-primary">
                <HiUpload /> {uploading ? "Upload..." : "Ajouter un fichier"}
              </button>
              <button onClick={() => setShowLinkModal(true)} className="btn-hero-secondary">
                <HiLink /> Ajouter un lien
              </button>
              <input ref={fileInputRef} type="file" multiple hidden onChange={handleFileUpload} />
            </div>
          </div>
          <div className="course-hero-visual">
            <div className="hero-visual-circle">
              <HiAcademicCap />
            </div>
          </div>
        </section>

        {/* Contents Section */}
        <section className="course-contents-section">
          <div className="section-header">
            <h2>Contenus du cours</h2>
            <span className="content-count">{contents.length} élément{contents.length > 1 ? 's' : ''}</span>
          </div>

          {contents.length === 0 ? (
            <div className="empty-contents">
              <div className="empty-icon">
                <HiFolder />
              </div>
              <h3>Aucun contenu pour le moment</h3>
              <p>Commencez par ajouter des fichiers, vidéos ou liens pour enrichir votre cours.</p>
              <div className="empty-actions">
                <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
                  <HiUpload /> Ajouter un fichier
                </button>
                <button onClick={() => setShowLinkModal(true)} className="btn-outline">
                  <HiLink /> Ajouter un lien
                </button>
              </div>
            </div>
          ) : (
            <div className="contents-grid">
              {contents.map((content) => (
                <div 
                  key={content.id} 
                  className="content-card"
                  onClick={() => handleContentClick(content)}
                >
                  <div className={`content-card-icon ${getContentColor(content.content_type)}`}>
                    {getContentIcon(content.content_type)}
                  </div>
                  <div className="content-card-body">
                    <h3 className="content-card-title">{content.title}</h3>
                    <p className="content-card-type">
                      {content.content_type === 'pdf' && 'Document PDF'}
                      {content.content_type === 'video' && 'Vidéo'}
                      {content.content_type === 'image' && 'Image'}
                      {content.content_type === 'link' && 'Lien externe'}
                      {content.content_type === 'file' && 'Fichier'}
                    </p>
                    <p className="content-card-date">
                      {new Date(content.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="content-card-actions">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleContentClick(content); }} 
                      className="action-btn action-view" 
                      title="Ouvrir"
                    >
                      <HiEye />
                    </button>
                    {content.file_path && (
                      <button 
                        onClick={(e) => handleDownload(content, e)}
                        className="action-btn action-download" 
                        title="Télécharger"
                      >
                        <HiDownload />
                      </button>
                    )}
                    <button 
                      onClick={(e) => handleDeleteContent(content.id, e)} 
                      className="action-btn action-delete" 
                      title="Supprimer"
                    >
                      <HiTrash />
                    </button>
                  </div>
                  <div className="content-card-overlay">
                    <span>Cliquez pour ouvrir</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal Ajout Lien */}
      {showLinkModal && (
        <div className="modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><HiLink /> Ajouter un lien</h2>
              <button onClick={() => setShowLinkModal(false)} className="modal-close"><HiX /></button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>URL *</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div className="form-group">
                <label>Titre (optionnel)</label>
                <input
                  type="text"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  placeholder="Ex: Introduction au cours"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowLinkModal(false)} className="btn-cancel">Annuler</button>
              <button onClick={handleAddLink} className="btn-confirm">Ajouter</button>
            </div>
          </div>
        </div>
      )}
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
