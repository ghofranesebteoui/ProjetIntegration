import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiPlus,
  HiTrash,
  HiAcademicCap,
  HiSave,
} from "react-icons/hi";
import { courseService } from "../../services/courseService";
import { assignmentService } from "../../services/assignmentService";
import Footer from "../../components/Footer";
import "./TeacherCourseDetail.css";
import "./TeacherAssignments.css";

export default function TeacherAssignmentCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const typeFromUrl = searchParams.get('type') || 'homework';

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Formulaire
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState(typeFromUrl);
  const [dueDate, setDueDate] = useState('');
  const [totalPoints, setTotalPoints] = useState(100);
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const data = await courseService.getAll();
      setCourses(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      question_text: '',
      question_type: 'multiple_choice',
      points: 1,
      correct_answer: '',
      options: ['', '', '', '']
    }]);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index][field] = value;
    setQuestions(updated);
  };

  const updateOption = (qIndex, optIndex, value) => {
    const updated = [...questions];
    updated[qIndex].options[optIndex] = value;
    setQuestions(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseId || !title) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      await assignmentService.create({
        course_id: parseInt(courseId),
        title,
        description,
        type,
        due_date: dueDate || null,
        total_points: totalPoints,
        questions: type === 'quiz' ? questions : []
      });

      alert('Devoir créé avec succès !');
      navigate('/enseignant/assignments');
    } catch (err) {
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

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
              <span className="breadcrumb-current">Créer</span>
            </div>
          </div>

         
        </div>
      </header>

      <main className="course-detail-main">
        <section className="course-contents-section">
          <div className="section-header">
            <h2>Créer un {type === 'quiz' ? 'quiz' : 'devoir'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informations de base */}
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Informations générales</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Cours *</label>
                  <select 
                    value={courseId} 
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    required
                  >
                    <option value="">Sélectionner un cours</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>{course.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Titre *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    placeholder="Ex: Quiz sur les Hooks React"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border rounded-lg"
                    rows="3"
                    placeholder="Description du devoir..."
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Type</label>
                    <select 
                      value={type} 
                      onChange={(e) => setType(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                    >
                      <option value="homework">Devoir</option>
                      <option value="quiz">Quiz</option>
                      <option value="exam">Examen</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Date limite</label>
                    <input
                      type="datetime-local"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full p-3 border rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Points totaux</label>
                    <input
                      type="number"
                      value={totalPoints}
                      onChange={(e) => setTotalPoints(parseInt(e.target.value))}
                      className="w-full p-3 border rounded-lg"
                      min="1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Questions (si quiz) */}
            {type === 'quiz' && (
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Questions</h3>
                  <button type="button" onClick={addQuestion} className="btn-primary">
                    <HiPlus /> Ajouter une question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Aucune question. Cliquez sur "Ajouter une question"</p>
                ) : (
                  <div className="space-y-4">
                    {questions.map((q, qIndex) => (
                      <div key={qIndex} className="question-card">
                        <div className="question-header">
                          <h4 className="question-number">Question {qIndex + 1}</h4>
                          <button type="button" onClick={() => removeQuestion(qIndex)} className="delete-question-btn">
                            <HiTrash />
                          </button>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm mb-1">Question</label>
                            <input
                              type="text"
                              value={q.question_text}
                              onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="Votre question..."
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-sm mb-1">Type</label>
                              <select
                                value={q.question_type}
                                onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                                className="w-full p-2 border rounded"
                              >
                                <option value="multiple_choice">QCM</option>
                                <option value="true_false">Vrai/Faux</option>
                                <option value="short_answer">Réponse courte</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm mb-1">Points</label>
                              <input
                                type="number"
                                value={q.points}
                                onChange={(e) => updateQuestion(qIndex, 'points', parseInt(e.target.value))}
                                className="w-full p-2 border rounded"
                                min="1"
                              />
                            </div>
                          </div>

                          {q.question_type === 'multiple_choice' && (
                            <div>
                              <label className="block text-sm mb-1">Options</label>
                              {q.options.map((opt, optIndex) => (
                                <input
                                  key={optIndex}
                                  type="text"
                                  value={opt}
                                  onChange={(e) => updateOption(qIndex, optIndex, e.target.value)}
                                  className="w-full p-2 border rounded mb-2"
                                  placeholder={`Option ${optIndex + 1}`}
                                />
                              ))}
                            </div>
                          )}

                          <div>
                            <label className="block text-sm mb-1">Réponse correcte</label>
                            <input
                              type="text"
                              value={q.correct_answer}
                              onChange={(e) => updateQuestion(qIndex, 'correct_answer', e.target.value)}
                              className="w-full p-2 border rounded"
                              placeholder="La bonne réponse..."
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-4 justify-end">
              <button 
                type="button" 
                onClick={() => navigate('/enseignant/assignments')}
                className="px-6 py-3 border rounded-lg"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary px-6 py-3"
              >
                <HiSave /> {loading ? 'Création...' : 'Créer le devoir'}
              </button>
            </div>
          </form>
        </section>
      </main>
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
