const express = require("express");
const router = express.Router();
const {
  getTeacherAssignments,
  getAssignmentById,
  createAssignment,
  gradeSubmission,
  deleteAssignment,
} = require("./assignment.controller");

const authMiddleware = require("../../middlewares/authMiddleware");

router.use(authMiddleware);

// Middleware de vérification du rôle enseignant/admin
const checkTeacherRole = (req, res, next) => {
  if (req.user.role !== "enseignant" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Accès refusé" });
  }
  next();
};

router.use(checkTeacherRole);

router.route("/").get(getTeacherAssignments).post(createAssignment);

router.route("/:id").get(getAssignmentById).delete(deleteAssignment);

router.post("/submissions/:submissionId/grade", gradeSubmission);

module.exports = router;
