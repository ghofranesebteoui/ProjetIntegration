import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiAcademicCap,
  HiPlus,
  HiTrash,
  HiCheckCircle,
  HiLightningBolt,
  HiSave,
  HiX,
  HiExclamationCircle,
  HiMenu,
  HiHome,
  HiBookOpen,
  HiClipboardList,
  HiCalendar,
  HiChatAlt2,
  HiBell,
  HiUser,
  HiLogout,
  HiChartBar,
  HiDocumentText,
} from "react-icons/hi";
import { teacherQuizService } from "../../services/quizService";
import { courseService } from "../../services/courseService";
import Footer from "../../components/Footer";
import "./TeacherCourseDetail.css";
import "./QuizPages.css";
import "../dashboard-base.css";

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    course_id: "",
    title: "",
    description: "",
    due_date: "",
  });
  const [questions, setQuestions] = useState([
    {
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      correct_answer: "",
      options: ["", "", "", ""],
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState("");
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadCourses();
    
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

  const loadCourses = async () => {
    try {
      setCoursesLoading(true);
      console.log("Chargement des cours...");
      const data = await courseService.getTeacherCourses();
      console.log("Cours chargés:", data);
      setCourses(data || []);
    } catch (err) {
      console.error("Erreur chargement cours:", err);
      setError(`Impossible de charger les cours: ${err.message}`);
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...questions];
    newQuestions[questionIndex].options[optionIndex] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: "",
        question_type: "multiple_choice",
        points: 1,
        correct_answer: "",
        options: ["", "", "", ""],
      },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      setError("Vous devez avoir au moins une question");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.course_id || !formData.title) {
      setError("Veuillez remplir tous les champs obligatoires");
      return;
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text || !q.correct_answer) {
        setError(`Question ${i + 1}: Veuillez remplir la question et la réponse correcte`);
        return;
      }
      if (q.question_type === "multiple_choice" && q.options.some((opt) => !opt)) {
        setError(`Question ${i + 1}: Veuillez remplir toutes les options`);
        return;
      }
    }

    setLoading(true);
    try {
      await teacherQuizService.create({
        ...formData,
        questions,
      });
      navigate("/enseignant/quiz");
    } catch (err) {
      console.error("Erreur:", err);
      setError("Erreur lors de la création du quiz");
    } finally {
      setLoading(false);
    }
  };

  const totalPoints = questions.reduce((sum, q) => sum + (parseInt(q.points) || 0), 0);

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
          {teacherMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`sidebar-nav-item ${item.id === "assignments" ? "active" : ""}`}
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
    <div className="course-detail-wrapper" style={{ background: "transparent", minHeight: "auto" }}>
      <main className="course-detail-main" style={{ padding: "2rem 0" }}>
        <div className="create-quiz-container">
          {/* Page Title */}
          <div className="create-quiz-header">
            <h1>Créer un quiz</h1>
            <p>Créez un quiz avec correction automatique pour vos étudiants</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="alert-error-box">
              <HiExclamationCircle />
              <span>{error}</span>
              <button onClick={() => setError("")}><HiX /></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Info Section */}
            <div className="form-section-card">
              <h2>Informations générales</h2>
              
              <div className="form-grid">
                <div className="form-group">
                  <label>Cours <span className="required">*</span></label>
                  <select
                    name="course_id"
                    value={formData.course_id}
                    onChange={handleInputChange}
                    required
                    disabled={coursesLoading}
                  >
                    <option value="">
                      {coursesLoading ? "Chargement des cours..." : "Sélectionner un cours"}
                    </option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                  {courses.length === 0 && !coursesLoading && (
                    <p style={{ fontSize: "0.75rem", color: "#ef4444", margin: "0.25rem 0 0 0" }}>
                      Aucun cours trouvé. Créez d'abord un cours.
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label>Titre du quiz <span className="required">*</span></label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Quiz Chapitre 1"
                  />
                </div>

                <div className="form-group">
                  <label>Date limite</label>
                  <input
                    type="datetime-local"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Description du quiz (optionnel)..."
                  />
                </div>
              </div>
            </div>

            {/* Questions Section */}
            <div className="questions-section-card">
              <div className="questions-header">
                <div>
                  <h2><HiLightningBolt /> Questions</h2>
                  <div className="questions-stats">
                    <span className="stat-item">{questions.length} question{questions.length > 1 ? "s" : ""}</span>
                    <span className="stat-item highlight"><HiCheckCircle /> {totalPoints} points</span>
                  </div>
                </div>
                <button type="button" onClick={addQuestion} className="btn-add-question">
                  <HiPlus /> Ajouter une question
                </button>
              </div>

              <div className="questions-list">
                {questions.map((question, qIndex) => (
                  <div key={qIndex} className="question-card">
                    <div className="question-card-header">
                      <div className="question-number">{qIndex + 1}</div>
                      <div className="question-info">
                        <span className="question-title">Question {qIndex + 1}</span>
                        <span className="question-meta">{question.points} point{question.points > 1 ? "s" : ""}</span>
                      </div>
                      {questions.length > 1 && (
                        <button type="button" onClick={() => removeQuestion(qIndex)} className="btn-delete">
                          <HiTrash />
                        </button>
                      )}
                    </div>

                    <div className="question-card-body">
                      <div className="form-group">
                        <label>Question <span className="required">*</span></label>
                        <textarea
                          value={question.question_text}
                          onChange={(e) => handleQuestionChange(qIndex, "question_text", e.target.value)}
                          required
                          rows={2}
                          placeholder="Entrez votre question..."
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Type de question</label>
                          <select
                            value={question.question_type}
                            onChange={(e) => handleQuestionChange(qIndex, "question_type", e.target.value)}
                          >
                            <option value="multiple_choice">Choix multiple</option>
                            <option value="true_false">Vrai/Faux</option>
                            <option value="short_answer">Réponse courte</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label>Points</label>
                          <input
                            type="number"
                            value={question.points}
                            onChange={(e) => handleQuestionChange(qIndex, "points", parseInt(e.target.value) || 1)}
                            min="1"
                          />
                        </div>
                      </div>

                      {question.question_type === "multiple_choice" && (
                        <div className="form-group">
                          <label>Options <span className="required">*</span></label>
                          <div className="options-list">
                            {question.options.map((option, oIndex) => (
                              <div key={oIndex} className="option-item">
                                <span className="option-letter">{String.fromCharCode(65 + oIndex)}</span>
                                <input
                                  type="text"
                                  value={option}
                                  onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                                  required
                                  placeholder={`Option ${String.fromCharCode(65 + oIndex)}`}
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="form-group">
                        <label>Réponse correcte <span className="required">*</span></label>
                        {question.question_type === "multiple_choice" ? (
                          <select
                            value={question.correct_answer}
                            onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                            required
                            className="select-correct"
                          >
                            <option value="">Sélectionner la bonne réponse</option>
                            {question.options.filter((opt) => opt).map((option, oIndex) => (
                              <option key={oIndex} value={option}>
                                {String.fromCharCode(65 + oIndex)} - {option}
                              </option>
                            ))}
                          </select>
                        ) : question.question_type === "true_false" ? (
                          <select
                            value={question.correct_answer}
                            onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                            required
                            className="select-correct"
                          >
                            <option value="">Sélectionner</option>
                            <option value="Vrai">Vrai</option>
                            <option value="Faux">Faux</option>
                          </select>
                        ) : (
                          <input
                            type="text"
                            value={question.correct_answer}
                            onChange={(e) => handleQuestionChange(qIndex, "correct_answer", e.target.value)}
                            required
                            placeholder="Réponse correcte attendue"
                            className="input-correct"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" onClick={() => navigate("/enseignant/quiz")} className="btn-cancel">
                <HiX /> Annuler
              </button>

              <div className="actions-right">
                <div className="summary-badge">
                  {questions.length} question{questions.length > 1 ? "s" : ""} • {totalPoints} pts
                </div>
                <button type="submit" disabled={loading} className="btn-submit">
                  {loading ? (
                    <>
                      <span className="spinner"></span>
                      Création...
                    </>
                  ) : (
                    <>
                      <HiSave /> Créer le quiz
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
          </div>
        </main>
      
        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
