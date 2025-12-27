const { pool } = require("../../config/db");

// Récupérer tous les quiz de l'enseignant
exports.getTeacherAssignments = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT a.*, c.title as course_title,
       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as total_submissions,
       (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id AND status = 'graded') as graded_submissions
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.teacher_id = ? AND a.type = 'quiz'
       ORDER BY a.created_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un quiz avec ses questions et soumissions
exports.getAssignmentById = async (req, res) => {
  try {
    const [assignments] = await pool.query(
      `SELECT a.*, c.title as course_title
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = ? AND a.teacher_id = ? AND a.type = 'quiz'`,
      [req.params.id, req.user.id]
    );

    if (assignments.length === 0) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    const assignment = assignments[0];

    // Récupérer les questions
    const [questions] = await pool.query(
      "SELECT * FROM quiz_questions WHERE assignment_id = ? ORDER BY order_index",
      [req.params.id]
    );

    // Récupérer les soumissions avec infos étudiants et leurs réponses
    const [submissions] = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email,
       (SELECT COUNT(*) FROM quiz_answers qa WHERE qa.submission_id = s.id AND qa.is_correct = 1) as correct_answers,
       (SELECT COUNT(*) FROM quiz_questions WHERE assignment_id = a.id) as total_questions
       FROM assignment_submissions s
       JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.assignment_id = ?
       ORDER BY s.submitted_at DESC`,
      [req.params.id]
    );

    res.json({ ...assignment, questions, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer un quiz
exports.createAssignment = async (req, res) => {
  try {
    const { course_id, title, description, due_date, questions } = req.body;

    // Calculer le total des points basé sur les questions
    let total_points = 0;
    if (questions && questions.length > 0) {
      total_points = questions.reduce(
        (sum, q) => sum + (parseFloat(q.points) || 1),
        0
      );
    }

    const [result] = await pool.query(
      `INSERT INTO assignments (course_id, teacher_id, title, description, type, due_date, total_points, status)
       VALUES (?, ?, ?, ?, 'quiz', ?, ?, 'published')`,
      [course_id, req.user.id, title, description || "", due_date, total_points]
    );

    const assignmentId = result.insertId;

    // Ajouter les questions
    if (questions && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await pool.query(
          `INSERT INTO quiz_questions (assignment_id, question_text, question_type, points, correct_answer, options, order_index)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            assignmentId,
            q.question_text,
            q.question_type,
            q.points || 1,
            q.correct_answer || "",
            JSON.stringify(q.options || []),
            i + 1,
          ]
        );
      }
    }

    const [newAssignment] = await pool.query(
      "SELECT * FROM assignments WHERE id = ?",
      [assignmentId]
    );

    res.status(201).json(newAssignment[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création" });
  }
};

// Récupérer les détails d'une soumission (pour consultation uniquement)
exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;

    const [submission] = await pool.query(
      `SELECT s.*, u.first_name, u.last_name, u.email, a.title as quiz_title
       FROM assignment_submissions s
       JOIN users u ON s.student_id = u.id
       JOIN assignments a ON s.assignment_id = a.id
       WHERE s.id = ? AND a.teacher_id = ?`,
      [submissionId, req.user.id]
    );

    if (submission.length === 0) {
      return res.status(404).json({ message: "Soumission non trouvée" });
    }

    // Récupérer les réponses détaillées
    const [answers] = await pool.query(
      `SELECT qa.*, qq.question_text, qq.correct_answer, qq.points as max_points
       FROM quiz_answers qa
       JOIN quiz_questions qq ON qa.question_id = qq.id
       WHERE qa.submission_id = ?
       ORDER BY qq.order_index`,
      [submissionId]
    );

    res.json({ ...submission[0], answers });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un quiz
exports.deleteAssignment = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM assignments WHERE id = ? AND teacher_id = ? AND type = 'quiz'",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Quiz non trouvé" });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression" });
  }
};
