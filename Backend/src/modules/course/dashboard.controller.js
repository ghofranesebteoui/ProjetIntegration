const { pool } = require("../../config/db");

// Récupérer le planning de l'enseignant
exports.getTeacherSchedule = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cs.*, c.title as course_title,
       (SELECT COUNT(DISTINCT student_id) FROM course_enrollments WHERE course_id = cs.course_id AND status = 'active') as students_count
       FROM course_schedule cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.teacher_id = ? AND cs.scheduled_date >= NOW() AND cs.status = 'scheduled'
       ORDER BY cs.scheduled_date ASC
       LIMIT 10`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer une session de planning
exports.createSchedule = async (req, res) => {
  try {
    const {
      course_id,
      title,
      description,
      scheduled_date,
      duration_minutes,
      location,
      type,
    } = req.body;

    if (!course_id || !title || !scheduled_date) {
      return res.status(400).json({ message: "Cours, titre et date requis" });
    }

    // Vérifier que le cours appartient à l'enseignant
    const [courses] = await pool.query(
      "SELECT id FROM courses WHERE id = ? AND teacherId = ?",
      [course_id, req.user.id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    const [result] = await pool.query(
      `INSERT INTO course_schedule (course_id, teacher_id, title, description, scheduled_date, duration_minutes, location, type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        course_id,
        req.user.id,
        title,
        description || null,
        scheduled_date,
        duration_minutes || 60,
        location || null,
        type || "lecture",
      ]
    );

    const [newSchedule] = await pool.query(
      `SELECT cs.*, c.title as course_title FROM course_schedule cs
       JOIN courses c ON cs.course_id = c.id WHERE cs.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newSchedule[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création planning" });
  }
};

// Supprimer une session de planning
exports.deleteSchedule = async (req, res) => {
  try {
    const [result] = await pool.query(
      "DELETE FROM course_schedule WHERE id = ? AND teacher_id = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Session non trouvée" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression" });
  }
};

// Récupérer les questions des étudiants
exports.getStudentQuestions = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT sq.*, c.title as course_title, u.first_name, u.last_name
       FROM student_questions sq
       JOIN courses c ON sq.course_id = c.id
       JOIN users u ON sq.student_id = u.id
       WHERE sq.teacher_id = ?
       ORDER BY sq.status ASC, sq.created_at DESC
       LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Répondre à une question
exports.answerQuestion = async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ message: "Réponse requise" });
    }

    const [result] = await pool.query(
      `UPDATE student_questions SET answer = ?, status = 'answered', answered_at = NOW()
       WHERE id = ? AND teacher_id = ?`,
      [answer, req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Question non trouvée" });
    }

    const [updated] = await pool.query(
      `SELECT sq.*, c.title as course_title, u.first_name, u.last_name
       FROM student_questions sq
       JOIN courses c ON sq.course_id = c.id
       JOIN users u ON sq.student_id = u.id
       WHERE sq.id = ?`,
      [req.params.id]
    );

    res.json(updated[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur réponse" });
  }
};

// Récupérer les ressources de l'enseignant (tous les contenus de ses cours)
exports.getTeacherResources = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cc.*, c.title as course_title
       FROM course_contents cc
       JOIN courses c ON cc.course_id = c.id
       WHERE c.teacherId = ?
       ORDER BY cc.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Statistiques complètes du dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    // Nombre de cours
    const [coursesCount] = await pool.query(
      "SELECT COUNT(*) as count FROM courses WHERE teacherId = ?",
      [req.user.id]
    );

    // Nombre d'étudiants inscrits
    const [studentsCount] = await pool.query(
      `SELECT COUNT(DISTINCT ce.student_id) as count 
       FROM course_enrollments ce
       JOIN courses c ON ce.course_id = c.id
       WHERE c.teacherId = ? AND ce.status = 'active'`,
      [req.user.id]
    );

    // Nombre de ressources
    const [resourcesCount] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM course_contents cc
       JOIN courses c ON cc.course_id = c.id
       WHERE c.teacherId = ?`,
      [req.user.id]
    );

    // Devoirs à corriger
    const [pendingCount] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       WHERE a.teacher_id = ? AND asub.status = 'submitted'`,
      [req.user.id]
    );

    // Questions en attente
    const [questionsCount] = await pool.query(
      `SELECT COUNT(*) as count FROM student_questions WHERE teacher_id = ? AND status = 'pending'`,
      [req.user.id]
    );

    // Prochains cours
    const [upcomingCount] = await pool.query(
      `SELECT COUNT(*) as count FROM course_schedule 
       WHERE teacher_id = ? AND scheduled_date >= NOW() AND status = 'scheduled'`,
      [req.user.id]
    );

    res.json({
      totalCourses: coursesCount[0]?.count || 0,
      totalStudents: studentsCount[0]?.count || 0,
      totalResources: resourcesCount[0]?.count || 0,
      pendingEvaluations: pendingCount[0]?.count || 0,
      pendingQuestions: questionsCount[0]?.count || 0,
      upcomingClasses: upcomingCount[0]?.count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
