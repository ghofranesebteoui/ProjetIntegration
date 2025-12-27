const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function setupGhofraneComplete() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
    multipleStatements: true,
  });

  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀 CONFIGURATION COMPLÈTE DE GHOFRANE SEBTEOUI");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Créer ou récupérer l'enseignante
    console.log("📝 Étape 1: Création de l'enseignante...");

    const password = "Ghofrane2024!";
    const hashedPassword = await bcrypt.hash(password, 10);

    await connection.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE role = 'teacher', is_verified = 1`,
      [
        "ghofrane.sebteoui@edunova.tn",
        hashedPassword,
        "Ghofrane",
        "Sebteoui",
        "teacher",
        1,
      ]
    );

    const [teacher] = await connection.query(
      `SELECT id, first_name, last_name, email FROM users WHERE email = ?`,
      ["ghofrane.sebteoui@edunova.tn"]
    );

    const teacherId = teacher[0].id;
    console.log(
      `✓ Enseignante: ${teacher[0].first_name} ${teacher[0].last_name} (ID: ${teacherId})`
    );
    console.log(`  Email: ${teacher[0].email}`);
    console.log(`  Mot de passe: ${password}\n`);

    // 2. Créer les cours
    console.log("📚 Étape 2: Création des cours...");

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

    const courseIds = [];

    for (const course of courses) {
      // Vérifier si le cours existe déjà
      const [existing] = await connection.query(
        `SELECT id FROM courses WHERE teacherId = ? AND title = ?`,
        [teacherId, course.title]
      );

      let courseId;
      if (existing.length > 0) {
        courseId = existing[0].id;
        console.log(`✓ Cours existant: ${course.title} (ID: ${courseId})`);
      } else {
        const [result] = await connection.query(
          `INSERT INTO courses (teacherId, title, description, createdAt, updatedAt)
           VALUES (?, ?, ?, NOW(), NOW())`,
          [teacherId, course.title, course.description]
        );
        courseId = result.insertId;
        console.log(`✓ Cours créé: ${course.title} (ID: ${courseId})`);
      }

      courseIds.push({ id: courseId, title: course.title });
    }
    console.log("");

    // 3. Créer les sessions de planning
    console.log("📅 Étape 3: Création des sessions de planning...");

    const now = new Date();
    let totalSessions = 0;

    for (const course of courseIds) {
      const sessions = [
        {
          title: "Introduction et concepts fondamentaux",
          description:
            "Présentation du cours, objectifs pédagogiques et introduction aux concepts de base",
          days: 2,
          hour: 9,
          minute: 0,
          duration: 90,
          location: "Amphithéâtre A",
          type: "lecture",
        },
        {
          title: "Travaux pratiques - Exercices guidés",
          description:
            "Mise en pratique des concepts vus en cours. Apportez votre ordinateur portable",
          days: 5,
          hour: 14,
          minute: 0,
          duration: 120,
          location: "Salle informatique B101",
          type: "lab",
        },
        {
          title: "Permanence - Questions/Réponses",
          description:
            "Session de questions-réponses pour clarifier les points difficiles",
          days: 7,
          hour: 10,
          minute: 30,
          duration: 60,
          location: "Bureau C205",
          type: "office_hours",
        },
        {
          title: "Concepts avancés et bonnes pratiques",
          description:
            "Approfondissement des notions et présentation des meilleures pratiques",
          days: 9,
          hour: 9,
          minute: 0,
          duration: 90,
          location: "Amphithéâtre A",
          type: "lecture",
        },
        {
          title: "Examen pratique",
          description:
            "Évaluation des compétences acquises tout au long du cours",
          days: 14,
          hour: 14,
          minute: 0,
          duration: 180,
          location: "Salle d'examen E301",
          type: "exam",
        },
      ];

      for (const session of sessions) {
        const sessionDate = new Date(now);
        sessionDate.setDate(sessionDate.getDate() + session.days);
        sessionDate.setHours(session.hour, session.minute, 0, 0);

        const [result] = await connection.query(
          `INSERT INTO course_schedule 
           (course_id, teacher_id, title, description, scheduled_date, duration_minutes, location, type, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
          [
            course.id,
            teacherId,
            session.title,
            session.description,
            sessionDate.toISOString().slice(0, 19).replace("T", " "),
            session.duration,
            session.location,
            session.type,
          ]
        );

        totalSessions++;

        const typeEmoji = {
          lecture: "📚",
          lab: "💻",
          exam: "📝",
          office_hours: "🕐",
        };

        console.log(`  ${typeEmoji[session.type]} ${course.title}`);
        console.log(`     ${session.title}`);
        console.log(
          `     ${sessionDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })} - ${session.duration}min - ${session.location}`
        );
      }
      console.log("");
    }

    // 4. Résumé final
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ CONFIGURATION TERMINÉE AVEC SUCCÈS !");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`👤 Enseignante: Ghofrane Sebteoui`);
    console.log(`📧 Email: ghofrane.sebteoui@edunova.tn`);
    console.log(`🔑 Mot de passe: ${password}`);
    console.log(`📚 Cours créés: ${courseIds.length}`);
    console.log(`📅 Sessions planifiées: ${totalSessions}`);
    console.log("═══════════════════════════════════════════════════════\n");

    // 5. Afficher les prochaines sessions
    const [upcoming] = await connection.query(
      `SELECT cs.*, c.title as course_title
       FROM course_schedule cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.teacher_id = ? AND cs.scheduled_date >= NOW()
       ORDER BY cs.scheduled_date ASC
       LIMIT 10`,
      [teacherId]
    );

    console.log("📅 PROCHAINES SESSIONS:");
    console.log("───────────────────────────────────────────────────────");
    upcoming.forEach((s, index) => {
      const date = new Date(s.scheduled_date);
      const typeEmoji = {
        lecture: "📚",
        lab: "💻",
        exam: "📝",
        office_hours: "🕐",
      };

      console.log(`${index + 1}. ${typeEmoji[s.type]} ${s.course_title}`);
      console.log(`   ${s.title}`);
      console.log(
        `   ${date.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
      console.log(`   ${s.location} - ${s.duration_minutes} minutes`);
      console.log("");
    });

    console.log("🎉 Vous pouvez maintenant vous connecter avec:");
    console.log(`   Email: ghofrane.sebteoui@edunova.tn`);
    console.log(`   Mot de passe: ${password}\n`);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

setupGhofraneComplete();
