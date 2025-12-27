import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  HiArrowLeft,
  HiAcademicCap,
  HiCheckCircle,
  HiClock,
  HiUser,
  HiDocumentText,
  HiX,
} from "react-icons/hi";
import { assignmentService } from "../../services/assignmentService";
import Footer from "../../components/Footer";
import "./TeacherCourseDetail.css";
import "./TeacherAssignments.css";

export default function TeacherAssignmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [grading, setGrading] = useState(false);

  useEffect(() => {
    loadAssignment();
  }, [id]);

  const loadAssignment = async () => {
    try {
      const data = await assignmentService.getById(id);
      setAssignment(data);
    } catch (err) {
      console.error(err);
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const openGradeModal = (submission) => {
    setSelectedSubmission(submission);
    setScore(submission.score || '');
    setFeedback(submission.feedback || '');
  };

  const handleGrade = async () => {
    if (!score || score < 0 || score > assignment.total_points) {
      alert(`La note doit être entre 0 et ${assignment.total_points}`);
      return;
    }

    setGrading(true);
    try {
      await assignmentService.gradeSubmission(selectedSubmission.id, parseFloat(score), feedback);
      alert('Note enregistrée !');
      setSelectedSubmission(null);
      await loadAssignment();
    } catch (err) {
      alert('Erreur: ' + err.message);
    } finally {
      setGrading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'submitted':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">En attente</span>;
      case 'graded':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Corrigé</span>;
      case 'late':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">En retard</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="course-detail-wrapper">
        <div className="course-detail-loading">
          <div className="loading-spinner"></div>
          <p>Chargement...</p>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="course-detail-wrapper">
        <div className="course-detail-error">
          <h2>Devoir non trouvé</h2>
          <button onClick={() => navigate('/enseignant/assignments')} className="btn-back-error">
            <HiArrowLeft /> Retour
          </button>
        </div>
      </div>
    );
  }

  const submissions = assignment.submissions || [];
  const pendingSubmissions = submissions.filter(s => s.status === 'submitted');
  const gradedSubmissions = submissions.filter(s => s.status === 'graded');

  return (
    <div className="course-detail-wrapper">
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
              <span onClick={() => navigate("/enseignant")} className="breadcrumb-link">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span onClick={() => navigate("/enseignant/assignments")} className="breadcrumb-link">Devoirs</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{assignment.title}</span>
            </div>
          </div>

          
        </div>
      </header>

      <main className="course-detail-main">
        {/* Infos du devoir */}
        <section className="course-hero" style={{ marginBottom: '2rem' }}>
          <div className="course-hero-content">
            <h1 className="course-hero-title">{assignment.title}</h1>
            <p className="course-hero-description">{assignment.description || 'Aucune description'}</p>
            <div className="course-hero-meta">
              <span className="meta-item">
                <HiDocumentText /> {assignment.course_title}
              </span>
              <span className="meta-item">
                <HiClock /> {assignment.due_date ? new Date(assignment.due_date).toLocaleDateString('fr-FR') : 'Pas de date limite'}
              </span>
              <span className="meta-item">
                Points: {assignment.total_points}
              </span>
            </div>
          </div>
        </section>

        {/* Statistiques */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total soumissions</div>
            <div className="stat-value">{submissions.length}</div>
          </div>
          <div className="stat-card pending">
            <div className="stat-label">À corriger</div>
            <div className="stat-value">{pendingSubmissions.length}</div>
          </div>
          <div className="stat-card completed">
            <div className="stat-label">Corrigés</div>
            <div className="stat-value">{gradedSubmissions.length}</div>
          </div>
        </div>

        {/* Liste des soumissions */}
        <section className="course-contents-section">
          <div className="section-header">
            <h2>Soumissions des étudiants</h2>
          </div>

          {submissions.length === 0 ? (
            <div className="empty-contents">
              <div className="empty-icon"><HiDocumentText /></div>
              <h3>Aucune soumission</h3>
              <p>Les étudiants n'ont pas encore soumis ce devoir.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((submission) => (
                <div key={submission.id} className="submission-card">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="student-avatar">
                      <HiUser />
                    </div>
                    <div className="submission-info">
                      <h3 className="student-name">{submission.first_name} {submission.last_name}</h3>
                      <p className="student-email">{submission.email}</p>
                      <p className="submission-date">
                        <HiClock /> Soumis le {new Date(submission.submitted_at).toLocaleString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {getStatusBadge(submission.status)}
                    
                    {submission.status === 'graded' ? (
                      <div className="score-display">
                        <div className="score-value">
                          {submission.score}/{assignment.total_points}
                        </div>
                        <div className="score-label">
                          {submission.feedback && '✓ Avec feedback'}
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => openGradeModal(submission)}
                        className="btn-primary"
                      >
                        Corriger
                      </button>
                    )}
                  </div>

                  {submission.status === 'graded' && submission.feedback && (
                    <div className="feedback-box">
                      <p className="feedback-text"><strong>Feedback:</strong> {submission.feedback}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal de correction */}
      {selectedSubmission && (
        <div className="modal-overlay" onClick={() => setSelectedSubmission(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Corriger la soumission</h2>
              <button onClick={() => setSelectedSubmission(null)} className="modal-close">
                <HiX />
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <p className="font-semibold">{selectedSubmission.first_name} {selectedSubmission.last_name}</p>
                <p className="text-sm text-gray-600">{selectedSubmission.email}</p>
              </div>

              <div className="form-group">
                <label>Note (sur {assignment.total_points}) *</label>
                <input
                  type="number"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="modal-input"
                  min="0"
                  max={assignment.total_points}
                  step="0.5"
                  required
                />
              </div>

              <div className="form-group">
                <label>Feedback (optionnel)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="modal-textarea"
                  rows="4"
                  placeholder="Commentaires pour l'étudiant..."
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setSelectedSubmission(null)} className="btn-cancel">
                Annuler
              </button>
              <button onClick={handleGrade} disabled={grading} className="btn-confirm">
                <HiCheckCircle /> {grading ? 'Enregistrement...' : 'Enregistrer la note'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
