const { pool } = require("../../config/db");
const path = require("path");
const fs = require("fs");

// Récupérer les cours de l'enseignant
exports.getTeacherCourses = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, u.first_name, u.last_name,
       (SELECT COUNT(*) FROM course_contents WHERE course_id = c.id) as contents_count,
       (SELECT COUNT(DISTINCT student_id) FROM course_enrollments WHERE course_id = c.id AND status = 'active') as students_count
       FROM courses c 
       JOIN users u ON c.teacherId = u.id 
       WHERE c.teacherId = ? 
       ORDER BY c.createdAt DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les statistiques de l'enseignant
exports.getTeacherStats = async (req, res) => {
  try {
    // Compter les devoirs à corriger
    const [pendingSubmissions] = await pool.query(
      `SELECT COUNT(*) as count 
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       WHERE a.teacher_id = ? AND asub.status = 'submitted'`,
      [req.user.id]
    );

    res.json({
      pendingEvaluations: pendingSubmissions[0]?.count || 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer un cours par ID avec ses contenus
exports.getCourseById = async (req, res) => {
  try {
    const [courses] = await pool.query(
      `SELECT c.*, u.first_name, u.last_name 
       FROM courses c 
       JOIN users u ON c.teacherId = u.id 
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    const course = courses[0];

    // Récupérer les contenus du cours
    const [contents] = await pool.query(
      `SELECT * FROM course_contents WHERE course_id = ? ORDER BY created_at ASC`,
      [req.params.id]
    );

    res.json({ ...course, contents });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer un cours
exports.createCourse = async (req, res) => {
  const { title, description = "" } = req.body;
  try {
    const [result] = await pool.query(
      "INSERT INTO courses (title, description, teacherId) VALUES (?, ?, ?)",
      [title, description, req.user.id]
    );

    const [newCourse] = await pool.query(
      `SELECT c.*, u.first_name, u.last_name 
       FROM courses c 
       JOIN users u ON c.teacherId = u.id 
       WHERE c.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newCourse[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur création" });
  }
};

// Mettre à jour un cours
exports.updateCourse = async (req, res) => {
  const { title, description } = req.body;
  try {
    await pool.query(
      "UPDATE courses SET title = ?, description = ?, updatedAt = NOW() WHERE id = ? AND teacherId = ?",
      [title, description, req.params.id, req.user.id]
    );

    const [updated] = await pool.query(
      `SELECT c.*, u.first_name, u.last_name 
       FROM courses c 
       JOIN users u ON c.teacherId = u.id 
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (updated.length === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ message: "Erreur mise à jour" });
  }
};

// Supprimer un cours
exports.deleteCourse = async (req, res) => {
  try {
    // Supprimer d'abord les contenus associés
    const [contents] = await pool.query(
      "SELECT file_path FROM course_contents WHERE course_id = ? AND content_type != ?",
      [req.params.id, "link"]
    );

    // Supprimer les fichiers physiques
    for (const content of contents) {
      if (content.file_path) {
        const filePath = path.join(
          __dirname,
          "../../../uploads",
          content.file_path
        );
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }

    await pool.query("DELETE FROM course_contents WHERE course_id = ?", [
      req.params.id,
    ]);

    const [result] = await pool.query(
      "DELETE FROM courses WHERE id = ? AND teacherId = ?",
      [req.params.id, req.user.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression" });
  }
};

// Ajouter un contenu (fichier uploadé)
exports.addContent = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { title } = req.body;

    // Vérifier que le cours appartient à l'enseignant
    const [courses] = await pool.query(
      "SELECT id FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, req.user.id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier fourni" });
    }

    const file = req.file;
    const contentType = getContentType(file.mimetype);

    const [result] = await pool.query(
      `INSERT INTO course_contents (course_id, content_type, title, file_path, file_name, mime_type) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        courseId,
        contentType,
        title || file.originalname,
        file.filename,
        file.originalname,
        file.mimetype,
      ]
    );

    const [newContent] = await pool.query(
      "SELECT * FROM course_contents WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newContent[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur ajout contenu" });
  }
};

// Ajouter un lien (vidéo YouTube, etc.)
exports.addLink = async (req, res) => {
  try {
    const { id: courseId } = req.params;
    const { title, url } = req.body;

    if (!url) {
      return res.status(400).json({ message: "URL requise" });
    }

    // Vérifier que le cours appartient à l'enseignant
    const [courses] = await pool.query(
      "SELECT id FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, req.user.id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    const contentType = isVideoUrl(url) ? "video" : "link";
    const contentTitle =
      title || (contentType === "video" ? "Vidéo" : "Lien externe");

    const [result] = await pool.query(
      `INSERT INTO course_contents (course_id, content_type, title, url) VALUES (?, ?, ?, ?)`,
      [courseId, contentType, contentTitle, url]
    );

    const [newContent] = await pool.query(
      "SELECT * FROM course_contents WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newContent[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur ajout lien" });
  }
};

// Supprimer un contenu
exports.deleteContent = async (req, res) => {
  try {
    const { id: courseId, contentId } = req.params;

    // Vérifier que le cours appartient à l'enseignant
    const [courses] = await pool.query(
      "SELECT id FROM courses WHERE id = ? AND teacherId = ?",
      [courseId, req.user.id]
    );

    if (courses.length === 0) {
      return res.status(404).json({ message: "Cours non trouvé" });
    }

    // Récupérer le contenu pour supprimer le fichier si nécessaire
    const [contents] = await pool.query(
      "SELECT * FROM course_contents WHERE id = ? AND course_id = ?",
      [contentId, courseId]
    );

    if (contents.length === 0) {
      return res.status(404).json({ message: "Contenu non trouvé" });
    }

    const content = contents[0];

    // Supprimer le fichier physique si c'est un fichier uploadé
    if (content.file_path) {
      const filePath = path.join(
        __dirname,
        "../../../uploads",
        content.file_path
      );
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query("DELETE FROM course_contents WHERE id = ?", [contentId]);

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Erreur suppression contenu" });
  }
};

// Helpers
function getContentType(mimetype) {
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("image/")) return "image";
  return "file";
}

function isVideoUrl(url) {
  return (
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
}
