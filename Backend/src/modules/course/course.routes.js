const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  getTeacherCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  addContent,
  addLink,
  deleteContent,
} = require("./course.controller");

const {
  getTeacherSchedule,
  createSchedule,
  deleteSchedule,
  getStudentQuestions,
  answerQuestion,
  getTeacherResources,
  getDashboardStats,
} = require("./dashboard.controller");

const authMiddleware = require("../../middlewares/authMiddleware");

// Configuration Multer pour l'upload
const uploadDir = path.join(__dirname, "../../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Nettoyer le nom du fichier (enlever les caractères spéciaux)
    const originalName = file.originalname;
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9._-]/g, "_");

    // Vérifier si un fichier avec ce nom existe déjà
    const filePath = path.join(uploadDir, sanitizedName);
    if (fs.existsSync(filePath)) {
      // Ajouter un timestamp si le fichier existe
      const ext = path.extname(sanitizedName);
      const nameWithoutExt = path.basename(sanitizedName, ext);
      cb(null, `${nameWithoutExt}_${Date.now()}${ext}`);
    } else {
      cb(null, sanitizedName);
    }
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB max
  // Tous les types de fichiers sont acceptés
});

router.use(authMiddleware);

// Middleware de vérification du rôle enseignant/admin
const checkTeacherRole = (req, res, next) => {
  if (req.user.role !== "enseignant" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};

// Routes protégées (enseignant/admin)
router.use(checkTeacherRole);

router.route("/").get(getTeacherCourses).post(createCourse);

// Route pour les statistiques (AVANT les routes avec :id)
router.get("/stats/teacher", require("./course.controller").getTeacherStats);

// Routes Dashboard dynamique (AVANT les routes avec :id)
router.get("/dashboard/stats", getDashboardStats);
router.get("/dashboard/schedule", getTeacherSchedule);
router.post("/dashboard/schedule", createSchedule);
router.delete("/dashboard/schedule/:id", deleteSchedule);
router.get("/dashboard/questions", getStudentQuestions);
router.put("/dashboard/questions/:id/answer", answerQuestion);
router.get("/dashboard/resources", getTeacherResources);

// Routes avec paramètre :id (APRÈS les routes statiques)
router.get("/:id", getCourseById);
router.route("/:id").put(updateCourse).delete(deleteCourse);

// Routes pour les contenus
router.post("/:id/contents", upload.single("file"), addContent);
router.post("/:id/links", addLink);
router.delete("/:id/contents/:contentId", deleteContent);

module.exports = router;
