import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiChatAlt2,
  HiX,
  HiClock,
  HiCheckCircle,
  HiArrowLeft,
  HiAcademicCap,
  HiReply,
} from "react-icons/hi";
import { dashboardService } from "../../services/dashboardService";
import Footer from "../../components/Footer";
import "./TeacherDashboard.css";

export default function TeacherQuestions() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [filter, setFilter] = useState("all"); // all, pending, answered

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getQuestions();
      setQuestions(data || []);
    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  };

  const openAnswerModal = (question) => {
    setSelectedQuestion(question);
    setAnswer(question.answer || "");
    setModalOpen(true);
  };

  const handleAnswer = async () => {
    if (!answer.trim()) {
      alert("Veuillez entrer une réponse");
      return;
    }

    try {
      await dashboardService.answerQuestion(selectedQuestion.id, answer);
      setModalOpen(false);
      setSelectedQuestion(null);
      setAnswer("");
      fetchQuestions();
    } catch (err) {
      alert("Erreur lors de l'envoi de la réponse");
    }
  };

  const formatDate = (dateStr) => {
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
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    return date.toLocaleDateString('fr-FR');
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === "pending") return q.status === "pending";
    if (filter === "answered") return q.status === "answered";
    return true;
  });

  const pendingCount = questions.filter(q => q.status === "pending").length;

  return (
    <div className="teacher-dashboard-wrapper">
      <header className="student-header">
        <div className="header-content">
          <div className="header-left">
            <button className="menu-toggle-btn" onClick={() => navigate("/enseignant")}>
              <HiArrowLeft />
            </button>
            <div className="logo">
              <div className="edunova-icon"><HiAcademicCap /></div>
              <span className="edunova-text">eduNova</span>
            </div>
          </div>
        </div>
      </header>

      <main className="student-main-content">
        <div className="student-container">
          <div className="page-header">
            <h1 className="page-main-title">
              <HiChatAlt2 style={{ display: "inline", marginRight: "0.5rem" }} />
              Questions des étudiants
              {pendingCount > 0 && (
                <span style={{ 
                  background: "#ef4444", 
                  color: "white", 
                  padding: "2px 10px", 
                  borderRadius: "20px",
                  fontSize: "0.875rem",
                  marginLeft: "0.75rem"
                }}>
                  {pendingCount} en attente
                </span>
              )}
            </h1>
            <p className="page-main-subtitle">Répondez aux questions de vos étudiants</p>
          </div>

          {/* Filtres */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <button 
              onClick={() => setFilter("all")}
              className={`student-primary-btn ${filter !== "all" ? "outline" : ""}`}
              style={filter !== "all" ? { background: "transparent", color: "#7c3aed", border: "1px solid #7c3aed" } : {}}
            >
              Toutes ({questions.length})
            </button>
            <button 
              onClick={() => setFilter("pending")}
              className={`student-primary-btn ${filter !== "pending" ? "outline" : ""}`}
              style={filter !== "pending" ? { background: "transparent", color: "#7c3aed", border: "1px solid #7c3aed" } : {}}
            >
              En attente ({pendingCount})
            </button>
            <button 
              onClick={() => setFilter("answered")}
              className={`student-primary-btn ${filter !== "answered" ? "outline" : ""}`}
              style={filter !== "answered" ? { background: "transparent", color: "#7c3aed", border: "1px solid #7c3aed" } : {}}
            >
              Répondues ({questions.filter(q => q.status === "answered").length})
            </button>
          </div>

          {loading ? (
            <p className="text-center py-12 text-gray-500">Chargement...</p>
          ) : filteredQuestions.length === 0 ? (
            <div className="student-content-card text-center py-16">
              <HiChatAlt2 className="mx-auto text-6xl text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                {filter === "pending" ? "Aucune question en attente" : 
                 filter === "answered" ? "Aucune question répondue" : 
                 "Aucune question pour le moment"}
              </p>
            </div>
          ) : (
            <div className="student-content-card">
              <div className="student-activity-list">
                {filteredQuestions.map((q) => (
                  <div key={q.id} className="student-activity-item" style={{ padding: "1.5rem", alignItems: "flex-start" }}>
                    <div 
                      className="activity-item-icon" 
                      style={{ 
                        background: q.status === "answered" ? "#dcfce7" : "#fef3c7",
                        color: q.status === "answered" ? "#16a34a" : "#d97706"
                      }}
                    >
                      {q.status === "answered" ? <HiCheckCircle /> : <HiChatAlt2 />}
                    </div>
                    <div className="activity-item-details" style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <p className="activity-item-action" style={{ fontWeight: "600" }}>
                          {q.first_name} {q.last_name}
                        </p>
                        <span style={{ 
                          background: q.status === "answered" ? "#dcfce7" : "#fef3c7",
                          color: q.status === "answered" ? "#16a34a" : "#d97706",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "0.75rem"
                        }}>
                          {q.status === "answered" ? "Répondu" : "En attente"}
                        </span>
                      </div>
                      <p style={{ color: "#6b7280", fontSize: "0.875rem", marginBottom: "0.5rem" }}>
                        {q.course_title}
                      </p>
                      <p style={{ 
                        background: "#f3f4f6", 
                        padding: "0.75rem", 
                        borderRadius: "8px",
                        marginBottom: "0.5rem"
                      }}>
                        {q.question}
                      </p>
                      {q.answer && (
                        <div style={{ 
                          background: "#ede9fe", 
                          padding: "0.75rem", 
                          borderRadius: "8px",
                          borderLeft: "3px solid #7c3aed"
                        }}>
                          <p style={{ fontSize: "0.75rem", color: "#7c3aed", marginBottom: "0.25rem" }}>Votre réponse :</p>
                          <p>{q.answer}</p>
                        </div>
                      )}
                      <p className="activity-item-time" style={{ marginTop: "0.5rem" }}>
                        <HiClock className="time-icon" /> {formatDate(q.created_at)}
                        {q.answered_at && ` • Répondu ${formatDate(q.answered_at)}`}
                      </p>
                    </div>
                    {q.status === "pending" && (
                      <button 
                        onClick={() => openAnswerModal(q)}
                        className="student-primary-btn"
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        <HiReply style={{ marginRight: "4px" }} /> Répondre
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modal réponse */}
      {modalOpen && selectedQuestion && (
        <>
          <div className="modal-overlay" onClick={() => setModalOpen(false)} />
          <div className="modal-container">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">Répondre à la question</h2>
                <button onClick={() => setModalOpen(false)} className="modal-close-btn"><HiX /></button>
              </div>
              <div className="modal-body">
                <div style={{ marginBottom: "1rem" }}>
                  <p style={{ fontWeight: "600", marginBottom: "0.25rem" }}>
                    {selectedQuestion.first_name} {selectedQuestion.last_name}
                  </p>
                  <p style={{ color: "#6b7280", fontSize: "0.875rem" }}>{selectedQuestion.course_title}</p>
                </div>
                <div style={{ 
                  background: "#f3f4f6", 
                  padding: "1rem", 
                  borderRadius: "8px",
                  marginBottom: "1rem"
                }}>
                  <p style={{ fontWeight: "500" }}>Question :</p>
                  <p>{selectedQuestion.question}</p>
                </div>
                <div className="modal-form-group">
                  <label className="modal-label">Votre réponse <span className="text-red-500">*</span></label>
                  <textarea
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="modal-textarea"
                    rows={5}
                    placeholder="Tapez votre réponse ici..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button onClick={() => setModalOpen(false)} className="modal-btn modal-btn-cancel">Annuler</button>
                <button onClick={handleAnswer} className="modal-btn modal-btn-save">Envoyer la réponse</button>
              </div>
            </div>
          </div>
        </>
      )}
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
