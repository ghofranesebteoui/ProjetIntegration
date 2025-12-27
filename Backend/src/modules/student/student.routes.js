const express = require("express");
const router = express.Router();
const {
  getStudentQuizzes,
  getQuizById,
  submitQuiz,
  getStudentBadges,
} = require("./student.controller");

const authMiddleware = require("../../middlewares/authMiddleware");

router.use(authMiddleware);

// Middleware de vérification du rôle étudiant
const checkStudentRole = (req, res, next) => {
  if (req.user.role !== "etudiant" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};

router.use(checkStudentRole);

router.get("/quizzes", getStudentQuizzes);
router.get("/quizzes/:id", getQuizById);
router.post("/quizzes/:id/submit", submitQuiz);
router.get("/badges", getStudentBadges);

module.exports = router;
