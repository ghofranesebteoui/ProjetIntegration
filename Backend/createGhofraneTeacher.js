const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function createGhofraneTeacher() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
  });

  try {
    console.log("Connexion à la base de données...\n");

    // Vérifier si l'utilisateur existe déjà
    const [existing] = await connection.query(
      `SELECT id, email FROM users WHERE email = ?`,
      ["ghofrane.sebteoui@edunova.tn"]
    );

    if (existing.length > 0) {
      console.log(
        "✓ L'enseignante Ghofrane Sebteoui existe déjà (ID: " +
          existing[0].id +
          ")"
      );
      console.log("  Email: " + existing[0].email + "\n");

      // Mettre à jour le rôle si nécessaire
      await connection.query(`UPDATE users SET role = 'teacher' WHERE id = ?`, [
        existing[0].id,
      ]);

      await connection.end();
      return existing[0].id;
    }

    // Créer le mot de passe hashé
    const password = "Ghofrane2024!";
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'enseignante
    const [result] = await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        "ghofrane.sebteoui@edunova.tn",
        hashedPassword,
        "Ghofrane",
        "Sebteoui",
        "teacher",
        1,
      ]
    );

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ ENSEIGNANTE CRÉÉE AVEC SUCCÈS !");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`ID: ${result.insertId}`);
    console.log(`Nom: Ghofrane Sebteoui`);
    console.log(`Email: ghofrane.sebteoui@edunova.tn`);
    console.log(`Mot de passe: ${password}`);
    console.log(`Rôle: Enseignant`);
    console.log("═══════════════════════════════════════════════════════\n");

    // Créer quelques cours pour l'enseignante
    console.log("Création de cours pour l'enseignante...\n");

    const courses = [
      {
        title: "Développement Web Avancé",
        description:
          "Maîtrisez React, Node.js et les architectures modernes du web",
      },
      {
        title: "Base de Données et SQL",
        description:
          "Conception, optimisation et administration de bases de données relationnelles",
      },
      {
        title: "JavaScript ES6+",
        description:
          "Les fonctionnalités modernes de JavaScript et les bonnes pratiques",
      },
    ];

    for (const course of courses) {
      const [courseResult] = await connection.query(
        `INSERT INTO courses (teacherId, title, description, createdAt, updatedAt)
         VALUES (?, ?, ?, NOW(), NOW())`,
        [result.insertId, course.title, course.description]
      );

      console.log(`✓ Cours créé (ID: ${courseResult.insertId})`);
      console.log(`  Titre: ${course.title}`);
      console.log(`  Description: ${course.description}\n`);
    }

    console.log("✅ Configuration terminée avec succès !\n");

    await connection.end();
    return result.insertId;
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    await connection.end();
    throw error;
  }
}

createGhofraneTeacher();
