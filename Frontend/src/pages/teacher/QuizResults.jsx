import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiAcademicCap,
  HiUsers,
  HiCheckCircle,
  HiClock,
  HiChartBar,
  HiClipboardList,
  HiBadgeCheck,
  HiRefresh,
  HiMenu,
  HiHome,
  HiBookOpen,
  HiCalendar,
  HiChatAlt2,
  HiBell,
  HiUser,
  HiX,
  HiLogout,
  HiDocumentText,
} from "react-icons/hi";
import { teacherQuizService } from "../../services/quizService";
import Footer from "../../components/Footer";
import "./TeacherCourseDetail.css";
import "./QuizPages.css";
import "../dashboard-base.css";

export default function QuizResults() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // États sidebar et profil
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  const loadQuiz = async () => {
    try {
      const data = await teacherQuizService.getById(id);
      setQuiz(data);
    } catch (err) {
      console.error("Erreur:", err);
      navigate("/enseignant/quiz");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuiz();
    
    // Récupérer l'utilisateur
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Erreur parsing user", err);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  const calculateStats = () => {
    if (!quiz?.submissions || quiz.submissions.length === 0) {
      return { average: 0, highest: 0, lowest: 0, passRate: 0 };
    }
    const scores = quiz.submissions.map((s) => parseFloat(s.score));
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const highest = Math.max(...scores);
    const lowest = Math.min(...scores);
    const passRate = (scores.filter((s) => s >= 50).length / scores.length) * 100;
    return { average, highest, lowest, passRate };
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "excellent";
    if (score >= 70) return "good";
    if (score >= 50) return "fair";
    return "poor";
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent";
    if (score >= 70) return "Bien";
    if (score >= 50) return "Passable";
    return "Insuffisant";
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner-lg"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!quiz) return null;

  const stats = calculateStats();
  const distributions = [
    { label: "Excellent", icon: "🏆", range: "≥ 90%", color: "green", min: 90, max: 100 },
    { label: "Bien", icon: "👍", range: "70-89%", color: "blue", min: 70, max: 89 },
    { label: "Passable", icon: "📝", range: "50-69%", color: "yellow", min: 50, max: 69 },
    { label: "Insuffisant", icon: "⚠️", range: "< 50%", color: "red", min: 0, max: 49 },
  ];

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
        <div className="quiz-results-container">
          {/* Quiz Info */}
          <div className="quiz-info-card">
            <div className="quiz-info-content">
              <h1>{quiz.title}</h1>
              <p className="quiz-course">{quiz.course_title}</p>
              {quiz.description && <p className="quiz-desc">{quiz.description}</p>}
              <div className="quiz-meta-row">
                <span><HiClipboardList /> {quiz.questions?.length || 0} question{quiz.questions?.length > 1 ? "s" : ""}</span>
                <span><HiCheckCircle /> {quiz.total_points} points</span>
                {quiz.due_date && <span><HiClock /> Échéance: {new Date(quiz.due_date).toLocaleDateString("fr-FR")}</span>}
              </div>
            </div>
            <button onClick={loadQuiz} className="btn-refresh">
              <HiRefresh /> Actualiser
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stats-card stats-blue">
              <div className="stats-card-header">
                <HiUsers className="stats-icon" />
                <span className="stats-label">Soumissions</span>
              </div>
              <p className="stats-value">{quiz.submissions?.length || 0}</p>
              <p className="stats-subtext">{quiz.submissions?.length > 0 ? "Quiz complété" : "En attente"}</p>
            </div>
            <div className="stats-card stats-green">
              <div className="stats-card-header">
                <HiChartBar className="stats-icon" />
                <span className="stats-label">Moyenne</span>
              </div>
              <p className="stats-value">{stats.average.toFixed(1)}%</p>
              <p className="stats-subtext">Moyenne de la classe</p>
            </div>
            <div className="stats-card stats-purple">
              <div className="stats-card-header">
                <HiCheckCircle className="stats-icon" />
                <span className="stats-label">Réussite</span>
              </div>
              <p className="stats-value">{stats.passRate.toFixed(0)}%</p>
              <p className="stats-subtext">{quiz.submissions?.filter((s) => parseFloat(s.score) >= 50).length || 0} réussi(s)</p>
            </div>
            <div className="stats-card stats-orange">
              <div className="stats-card-header">
                <HiClock className="stats-icon" />
                <span className="stats-label">Écart</span>
              </div>
              <p className="stats-value">{stats.lowest.toFixed(0)}% - {stats.highest.toFixed(0)}%</p>
              <p className="stats-subtext">Intervalle: {(stats.highest - stats.lowest).toFixed(0)}%</p>
            </div>
          </div>

          {/* Score Distribution */}
          {quiz.submissions && quiz.submissions.length > 0 && (
            <div className="section-card">
              <div className="section-card-header">
                <h2><HiChartBar /> Distribution des scores</h2>
              </div>
              <div className="distribution-grid">
                {distributions.map((dist) => {
                  const count = quiz.submissions.filter(
                    (s) => parseFloat(s.score) >= dist.min && parseFloat(s.score) <= dist.max
                  ).length;
                  const percentage = ((count / quiz.submissions.length) * 100).toFixed(0);
                  return (
                    <div key={dist.label} className={`distribution-card distribution-${dist.color}`}>
                      <div className="distribution-header">
                        <span className="distribution-label">{dist.icon} {dist.label}</span>
                        <span className="distribution-range">{dist.range}</span>
                      </div>
                      <p className="distribution-count">{count}</p>
                      <p className="distribution-percent">{percentage}% des étudiants</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Questions */}
          <div className="section-card">
            <div className="section-card-header">
              <h2><HiClipboardList /> Questions du quiz</h2>
              <span className="section-badge">{quiz.questions?.length || 0} questions</span>
            </div>
            <div className="questions-list-results">
              {quiz.questions?.map((question, index) => (
                <div key={question.id} className="question-item-result">
                  <div className="question-num">{index + 1}</div>
                  <div className="question-content-result">
                    <p className="question-text-result">{question.question_text}</p>
                    <div className="question-badges">
                      <span className="q-badge">
                        {question.question_type === "multiple_choice" ? "Choix multiple" : 
                         question.question_type === "true_false" ? "Vrai/Faux" : "Réponse courte"}
                      </span>
                      <span className="q-badge q-points">{question.points} pt{question.points > 1 ? "s" : ""}</span>
                      <span className="q-badge q-answer"><HiCheckCircle /> {question.correct_answer}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submissions Table */}
          <div className="section-card">
            <div className="section-card-header">
              <h2><HiUsers /> Soumissions des étudiants</h2>
              <span className="section-badge">{quiz.submissions?.length || 0} soumission{quiz.submissions?.length > 1 ? "s" : ""}</span>
            </div>
            
            {!quiz.submissions || quiz.submissions.length === 0 ? (
              <div className="empty-state">
                <HiUsers style={{ fontSize: "48px", color: "#d1d5db" }} />
                <p className="empty-title">Aucune soumission</p>
                <p className="empty-text">Les résultats apparaîtront ici une fois que les étudiants auront passé le quiz</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table className="submissions-table">
                  <thead>
                    <tr>
                      <th>Étudiant</th>
                      <th>Email</th>
                      <th>Score</th>
                      <th>Bonnes réponses</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quiz.submissions.map((sub, idx) => (
                      <tr key={sub.id} className={idx % 2 === 0 ? "even" : "odd"}>
                        <td>
                          <div className="student-cell">
                            <div className="student-avatar">{sub.first_name[0]}{sub.last_name[0]}</div>
                            <span>{sub.first_name} {sub.last_name}</span>
                          </div>
                        </td>
                        <td>{sub.email}</td>
                        <td>
                          <div className="score-cell">
                            <span className={`score-value score-${getScoreColor(sub.score)}`}>
                              {parseFloat(sub.score).toFixed(1)}%
                            </span>
                            {parseFloat(sub.score) >= 90 && <HiBadgeCheck className="score-badge" />}
                            <span className={`score-label-tag score-${getScoreColor(sub.score)}`}>
                              {getScoreLabel(sub.score)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="answers-cell">
                            <span>{sub.correct_answers} / {sub.total_questions}</span>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: `${(sub.correct_answers / sub.total_questions) * 100}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="date-cell">
                            <span>{new Date(sub.submitted_at).toLocaleDateString("fr-FR")}</span>
                            <span className="date-time">{new Date(sub.submitted_at).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
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
