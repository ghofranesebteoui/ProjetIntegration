import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  HiArrowLeft,
  HiAcademicCap,
  HiCheckCircle,
  HiXCircle,
  HiBadgeCheck,
} from "react-icons/hi";
import { quizService } from "../../services/quizService";
import Footer from "../../components/Footer";
import "../teacher/TeacherCourseDetail.css";

export default function TakeQuiz() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [id]);

  const loadQuiz = async () => {
    try {
      const data = await quizService.getById(id);
      setQuiz(data);
      
      // Si déjà complété, afficher les résultats
      if (data.submission_id) {
        const answersObj = {};
        data.questions.forEach(q => {
          answersObj[q.id] = q.answer_text;
        });
        setAnswers(answersObj);
      }
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors du chargement du quiz");
      navigate("/etudiant/quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      alert("Veuillez répondre à toutes les questions");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir soumettre ce quiz ? Vous ne pourrez plus modifier vos réponses.")) {
      return;
    }

    setSubmitting(true);
    try {
      const resultData = await quizService.submit(id, answers);
      setResult(resultData);
      
      // Recharger le quiz pour voir les réponses correctes
      await loadQuiz();
    } catch (err) {
      console.error("Erreur:", err);
      alert("Erreur lors de la soumission du quiz");
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestion = (question, index) => {
    const isCompleted = quiz.submission_id;
    const userAnswer = answers[question.id] || "";
    
    return (
      <div key={question.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
            {index + 1}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium">{question.question_text}</h3>
              <span className="text-sm text-gray-500 ml-4">{question.points} pt{question.points > 1 ? 's' : ''}</span>
            </div>

            {question.question_type === "multiple_choice" && (
              <div className="space-y-2">
                {JSON.parse(question.options || "[]").map((option, idx) => (
                  <label 
                    key={idx} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isCompleted 
                        ? option === question.correct_answer 
                          ? 'bg-green-50 border-green-300'
                          : option === userAnswer && option !== question.correct_answer
                            ? 'bg-red-50 border-red-300'
                            : 'bg-gray-50 border-gray-200'
                        : userAnswer === option
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={isCompleted}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">{option}</span>
                    {isCompleted && option === question.correct_answer && (
                      <HiCheckCircle className="text-green-600 text-xl" />
                    )}
                    {isCompleted && option === userAnswer && option !== question.correct_answer && (
                      <HiXCircle className="text-red-600 text-xl" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.question_type === "true_false" && (
              <div className="space-y-2">
                {["Vrai", "Faux"].map((option) => (
                  <label 
                    key={option} 
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isCompleted 
                        ? option === question.correct_answer 
                          ? 'bg-green-50 border-green-300'
                          : option === userAnswer && option !== question.correct_answer
                            ? 'bg-red-50 border-red-300'
                            : 'bg-gray-50 border-gray-200'
                        : userAnswer === option
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={userAnswer === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      disabled={isCompleted}
                      className="w-4 h-4"
                    />
                    <span className="flex-1">{option}</span>
                    {isCompleted && option === question.correct_answer && (
                      <HiCheckCircle className="text-green-600 text-xl" />
                    )}
                    {isCompleted && option === userAnswer && option !== question.correct_answer && (
                      <HiXCircle className="text-red-600 text-xl" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {question.question_type === "short_answer" && (
              <div>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  disabled={isCompleted}
                  placeholder="Votre réponse..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {isCompleted && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Réponse correcte: <span className="font-semibold text-green-600">{question.correct_answer}</span>
                    </p>
                    {question.is_correct ? (
                      <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                        <HiCheckCircle /> Correct
                      </p>
                    ) : (
                      <p className="text-sm text-red-600 flex items-center gap-1 mt-1">
                        <HiXCircle /> Incorrect
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {isCompleted && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-sm font-medium">
                  Points obtenus: <span className={question.is_correct ? "text-green-600" : "text-red-600"}>
                    {question.points_earned || 0} / {question.points}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Chargement...</p>
      </div>
    );
  }

  if (!quiz) {
    return null;
  }

  const isCompleted = quiz.submission_id;

  return (
    <div className="course-detail-wrapper">
      {/* Header */}
      <header className="course-detail-header">
        <div className="header-container">
          <div className="header-left">
            <button onClick={() => navigate("/etudiant/quiz")} className="back-button">
              <HiArrowLeft />
            </button>
            <div className="logo">
              <div className="logo-icon"><HiAcademicCap /></div>
              <span className="logo-text">eduNova</span>
            </div>
          </div>
          
          <div className="header-center">
            <div className="header-breadcrumb">
              <span onClick={() => navigate("/etudiant")} className="breadcrumb-link">Dashboard</span>
              <span className="breadcrumb-separator">/</span>
              <span onClick={() => navigate("/etudiant/quiz")} className="breadcrumb-link">Quiz</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{quiz.title}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="header-avatar">ET</div>
          </div>
        </div>
      </header>

      <main className="course-detail-main max-w-4xl mx-auto">
        {/* Quiz Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 mb-6">
          <h1 className="text-3xl font-bold mb-2">{quiz.title}</h1>
          <p className="text-gray-600 mb-4">{quiz.course_title}</p>
          {quiz.description && (
            <p className="text-gray-700 mb-4">{quiz.description}</p>
          )}
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span>{quiz.questions?.length || 0} question{quiz.questions?.length > 1 ? 's' : ''}</span>
            <span>{quiz.total_points} points</span>
            {quiz.due_date && (
              <span>Échéance: {new Date(quiz.due_date).toLocaleDateString('fr-FR')}</span>
            )}
          </div>
        </div>

        {/* Result Banner */}
        {result && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 shadow-sm border border-green-200 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-green-700 mb-2">Quiz soumis avec succès !</h2>
                <p className="text-lg">
                  Score: <span className="font-bold text-green-600">{result.score}%</span> ({result.totalScore}/{result.totalPoints} points)
                </p>
              </div>
              {result.badges && result.badges.length > 0 && (
                <div className="text-center">
                  <HiBadgeCheck className="text-yellow-500 text-5xl mx-auto mb-2" />
                  <p className="text-sm font-semibold">Nouveau{result.badges.length > 1 ? 'x' : ''} badge{result.badges.length > 1 ? 's' : ''} !</p>
                  {result.badges.map(badge => (
                    <p key={badge.id} className="text-xs text-gray-600">{badge.name}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Score Display for Completed Quiz */}
        {isCompleted && !result && (
          <div className="bg-blue-50 rounded-lg p-6 shadow-sm border border-blue-200 mb-6">
            <h2 className="text-xl font-bold text-blue-700 mb-2">Résultats</h2>
            <p className="text-lg">
              Score: <span className="font-bold text-blue-600">{quiz.score}%</span>
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Soumis le {new Date(quiz.submitted_at).toLocaleDateString('fr-FR')} à {new Date(quiz.submitted_at).toLocaleTimeString('fr-FR')}
            </p>
          </div>
        )}

        {/* Questions */}
        <div className="mb-6">
          {quiz.questions?.map((question, index) => renderQuestion(question, index))}
        </div>

        {/* Submit Button */}
        {!isCompleted && (
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 sticky bottom-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {Object.keys(answers).length} / {quiz.questions?.length || 0} question{quiz.questions?.length > 1 ? 's' : ''} répondue{Object.keys(answers).length > 1 ? 's' : ''}
              </p>
              <button
                onClick={handleSubmit}
                disabled={submitting || Object.keys(answers).length < quiz.questions?.length}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? "Soumission..." : "Soumettre le quiz"}
              </button>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="text-center">
            <button
              onClick={() => navigate("/etudiant/quiz")}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Retour aux quiz
            </button>
          </div>
        )}
      </main>
      
      {/* FOOTER */}
      <Footer />
    </div>
  );
}
