const { pool } = require("../../config/db");

// Récupérer tous les quiz disponibles pour l'étudiant
exports.getStudentQuizzes = async (req, res) => {
  try {
    const [quizzes] = await pool.query(
      `SELECT 
        a.id, a.title, a.description, a.due_date, a.total_points,
        c.title as course_title, c.id as course_id,
        CASE 
          WHEN asub.id IS NOT NULL THEN 'completed'
          ELSE 'available'
        END as status,
        asub.score,
        asub.submitted_at
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN course_enrollments ce ON c.id = ce.course_id
       LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
       WHERE ce.student_id = ? AND a.type = 'quiz' AND a.status = 'published'
       ORDER BY a.due_date ASC, a.created_at DESC`,
      [req.user.id, req.user.id]
    );
    res.json(quizzes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un quiz avec ses questions
exports.getQuizById = async (req, res) => {
  try {
    const [quizzes] = await pool.query(
      `SELECT 
        a.*, c.title as course_title,
        asub.id as submission_id, asub.score, asub.submitted_at
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       JOIN course_enrollments ce ON c.id = ce.course_id
       LEFT JOIN assignment_submissions asub ON a.id = asub.assignment_id AND asub.student_id = ?
       WHERE a.id = ? AND ce.student_id = ? AND a.type = 'quiz'`,
      [req.user.id, req.params.id, req.user.id]
    );

    if (quizzes.length === 0) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    const quiz = quizzes[0];

    // Si déjà soumis, récupérer les réponses
    if (quiz.submission_id) {
      const [questions] = await pool.query(
        `SELECT 
          qq.id, qq.question_text, qq.question_type, qq.points, qq.options,
          qa.answer_text, qa.is_correct, qa.points_earned, qq.correct_answer
         FROM quiz_questions qq
         LEFT JOIN quiz_answers qa ON qq.id = qa.question_id AND qa.submission_id = ?
         WHERE qq.assignment_id = ?
         ORDER BY qq.order_index`,
        [quiz.submission_id, req.params.id]
      );
      quiz.questions = questions;
    } else {
      // Sinon, récupérer seulement les questions sans les réponses correctes
      const [questions] = await pool.query(
        `SELECT id, question_text, question_type, points, options, order_index
         FROM quiz_questions
         WHERE assignment_id = ?
         ORDER BY order_index`,
        [req.params.id]
      );
      quiz.questions = questions;
    }

    res.json(quiz);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Soumettre un quiz avec notation automatique
exports.submitQuiz = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { answers } = req.body; // { questionId: answerText }
    const quizId = req.params.id;
    const studentId = req.user.id;

    // Vérifier si déjà soumis
    const [existing] = await connection.query(
      "SELECT id FROM assignment_submissions WHERE assignment_id = ? AND student_id = ?",
      [quizId, studentId]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: "Quiz déjà soumis" });
    }

    // Récupérer les questions avec réponses correctes
    const [questions] = await connection.query(
      "SELECT * FROM quiz_questions WHERE assignment_id = ? ORDER BY order_index",
      [quizId]
    );

    // Créer la soumission
    const [submission] = await connection.query(
      `INSERT INTO assignment_submissions (assignment_id, student_id, status, submitted_at)
       VALUES (?, ?, 'graded', NOW())`,
      [quizId, studentId]
    );

    const submissionId = submission.insertId;
    let totalScore = 0;
    let totalPoints = 0;

    // Corriger chaque réponse automatiquement
    for (const question of questions) {
      const studentAnswer = answers[question.id] || "";
      let isCorrect = false;
      let pointsEarned = 0;

      totalPoints += parseFloat(question.points);

      // Vérifier la réponse selon le type de question
      if (
        question.question_type === "multiple_choice" ||
        question.question_type === "true_false"
      ) {
        isCorrect =
          studentAnswer.trim().toLowerCase() ===
          question.correct_answer.trim().toLowerCase();
        pointsEarned = isCorrect ? parseFloat(question.points) : 0;
      } else if (question.question_type === "short_answer") {
        // Pour les réponses courtes, vérification exacte (peut être amélioré)
        isCorrect =
          studentAnswer.trim().toLowerCase() ===
          question.correct_answer.trim().toLowerCase();
        pointsEarned = isCorrect ? parseFloat(question.points) : 0;
      }

      totalScore += pointsEarned;

      // Enregistrer la réponse
      await connection.query(
        `INSERT INTO quiz_answers (submission_id, question_id, answer_text, is_correct, points_earned)
         VALUES (?, ?, ?, ?, ?)`,
        [submissionId, question.id, studentAnswer, isCorrect, pointsEarned]
      );
    }

    // Calculer le score en pourcentage
    const scorePercentage =
      totalPoints > 0 ? (totalScore / totalPoints) * 100 : 0;

    // Mettre à jour la soumission avec le score
    await connection.query(
      `UPDATE assignment_submissions 
       SET score = ?, graded_at = NOW()
       WHERE id = ?`,
      [scorePercentage.toFixed(2), submissionId]
    );

    // Attribution des badges
    await awardBadges(connection, studentId, quizId, scorePercentage);

    await connection.commit();

    // Récupérer les badges gagnés
    const [newBadges] = await connection.query(
      `SELECT b.* FROM student_badges sb
       JOIN badges b ON sb.badge_id = b.id
       WHERE sb.student_id = ? AND sb.quiz_id = ?`,
      [studentId, quizId]
    );

    res.json({
      submissionId,
      score: scorePercentage.toFixed(2),
      totalScore,
      totalPoints,
      badges: newBadges,
      message: "Quiz soumis et corrigé automatiquement",
    });
  } catch (err) {
    await connection.rollback();
    console.error(err);
    res.status(500).json({ message: "Erreur lors de la soumission" });
  } finally {
    connection.release();
  }
};

// Fonction pour attribuer les badges
async function awardBadges(connection, studentId, quizId, scorePercentage) {
  // Compter le nombre de quiz complétés
  const [quizCount] = await connection.query(
    `SELECT COUNT(*) as count FROM assignment_submissions 
     WHERE student_id = ? AND status = 'graded'`,
    [studentId]
  );

  const completedQuizzes = quizCount[0].count;

  // Récupérer tous les badges
  const [badges] = await connection.query("SELECT * FROM badges");

  for (const badge of badges) {
    let shouldAward = false;

    if (
      badge.criteria_type === "quiz_completion" &&
      completedQuizzes >= badge.criteria_value
    ) {
      // Vérifier si le badge n'a pas déjà été attribué
      const [existing] = await connection.query(
        "SELECT id FROM student_badges WHERE student_id = ? AND badge_id = ?",
        [studentId, badge.id]
      );

      if (existing.length === 0) {
        shouldAward = true;
      }
    } else if (
      badge.criteria_type === "quiz_score" &&
      scorePercentage >= badge.criteria_value
    ) {
      shouldAward = true;
    }

    if (shouldAward) {
      await connection.query(
        `INSERT INTO student_badges (student_id, badge_id, quiz_id, earned_at)
         VALUES (?, ?, ?, NOW())`,
        [studentId, badge.id, quizId]
      );
    }
  }
}

// Récupérer les badges de l'étudiant
exports.getStudentBadges = async (req, res) => {
  try {
    const [badges] = await pool.query(
      `SELECT b.*, sb.earned_at, a.title as quiz_title
       FROM student_badges sb
       JOIN badges b ON sb.badge_id = b.id
       LEFT JOIN assignments a ON sb.quiz_id = a.id
       WHERE sb.student_id = ?
       ORDER BY sb.earned_at DESC`,
      [req.user.id]
    );
    res.json(badges);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
