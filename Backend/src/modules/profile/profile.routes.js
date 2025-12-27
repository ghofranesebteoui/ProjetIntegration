const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middlewares/authmiddleware");
const { pool } = require("../../config/db");

// =======================================
// GET /api/profile/me
// =======================================
router.get("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        p.phone,
        p.address,
        p.age,
        p.profile_image,
        p.level,
        p.enrollment_year,
        p.specialty,
        p.years_experience
      FROM users u
      LEFT JOIN profile p ON p.email COLLATE utf8mb4_unicode_ci = u.email
      WHERE u.id = ?
    `;

    const [results] = await pool.query(sql, [userId]);

    if (results.length === 0) {
      return res.status(404).json({ msg: "Utilisateur non trouvé" });
    }

    const data = results[0];

    res.json({
      _id: data.id.toString(),
      first_name: data.first_name || "",
      last_name: data.last_name || "",
      email: data.email,
      role: data.role,
      phone: data.phone || "",
      address: data.address || "",
      age: data.age || null,
      profile_image: data.profile_image || null,
      level: data.level || "",
      enrollment_year: data.enrollment_year || null,
      specialty: data.specialty || "",
      years_experience: data.years_experience || null,
    });
  } catch (error) {
    console.error("Erreur SQL /api/profile/me :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// =======================================
// PUT /api/profile/me
// =======================================
router.put("/me", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      first_name,
      last_name,
      phone,
      address,
      age,
      profile_image,
      specialty,
      years_experience,
    } = req.body;

    const ageValue = age || null;
    const yearsValue = years_experience || null;

    // Mettre à jour la table users
    await pool.query(
      `UPDATE users SET first_name = ?, last_name = ? WHERE id = ?`,
      [first_name, last_name, userId]
    );

    // Mettre à jour la table profile
    await pool.query(
      `UPDATE profile
       SET phone = ?, address = ?, age = ?, profile_image = ?, specialty = ?, years_experience = ?
       WHERE email COLLATE utf8mb4_unicode_ci = (SELECT email FROM users WHERE id = ?)`,
      [phone, address, ageValue, profile_image, specialty, yearsValue, userId]
    );

    // Récupérer les données mises à jour
    const sql = `
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.role,
        p.phone,
        p.address,
        p.age,
        p.profile_image,
        p.level,
        p.enrollment_year,
        p.specialty,
        p.years_experience
      FROM users u
      LEFT JOIN profile p ON p.email COLLATE utf8mb4_unicode_ci = u.email
      WHERE u.id = ?
    `;

    const [results] = await pool.query(sql, [userId]);
    const data = results[0];

    res.json({
      msg: "Profil mis à jour avec succès",
      user: {
        _id: data.id.toString(),
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email,
        role: data.role,
        phone: data.phone || "",
        address: data.address || "",
        age: data.age || null,
        profile_image: data.profile_image || null,
        level: data.level || "",
        enrollment_year: data.enrollment_year || null,
        specialty: data.specialty || "",
        years_experience: data.years_experience || null,
      },
    });
  } catch (error) {
    console.error("Erreur SQL PUT /api/profile/me :", error);
    res.status(500).json({ error: error.message });
  }
});

// =======================================
// PUT /api/profile/me/password
// =======================================
router.put("/me/password", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: "Tous les champs sont requis" });
    }

    const [rows] = await pool.query(
      "SELECT password_hash FROM users WHERE id = ?",
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Mot de passe actuel incorrect" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    res.json({ msg: "Mot de passe mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur SQL PUT /api/profile/me/password :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

// =======================================
// POST /api/profile/me/avatar
// =======================================
router.post("/me/avatar", auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { profile_image } = req.body;

    await pool.query(
      `UPDATE profile SET profile_image = ? WHERE email COLLATE utf8mb4_unicode_ci = (SELECT email FROM users WHERE id = ?)`,
      [profile_image, userId]
    );

    res.json({ msg: "Avatar mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur SQL POST /api/profile/me/avatar :", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

module.exports = router;
