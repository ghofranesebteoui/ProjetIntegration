const mysql = require("mysql2/promise");
require("dotenv").config();

async function insertScheduleForGhofrane() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
  });

  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀 INSERTION DE PLANNING POUR GHOFRANE SEBTEOUI");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Trouver l'enseignante par email
    const [users] = await connection.query(
      `SELECT id, first_name, last_name, email, role 
       FROM users 
       WHERE email = ?`,
      ["ghofranesebteoui@gmail.com"]
    );

    if (users.length === 0) {
      console.log(
        "❌ Enseignante avec email ghofranesebteoui@gmail.com non trouvée\n"
      );
      console.log("Recherche de tous les enseignants dans la base...\n");

      const [teachers] = await connection.query(
        `SELECT id, first_name, last_name, email, role FROM users WHERE role = 'teacher'`
      );

      if (teachers.length === 0) {
        console.log("❌ Aucun enseignant trouvé dans la base de données\n");
      } else {
        console.log("📋 Enseignants disponibles:");
        teachers.forEach((t) => {
          console.log(
            `  • ID: ${t.id} | ${t.first_name} ${t.last_name} | ${t.email}`
          );
        });
      }

      await connection.end();
      return;
    }

    const teacher = users[0];
    console.log("✅ Enseignante trouvée:");
    console.log(`   Nom: ${teacher.first_name} ${teacher.last_name}`);
    console.log(`   Email: ${teacher.email}`);
    console.log(`   ID: ${teacher.id}`);
    console.log(`   Rôle: ${teacher.role}\n`);

    // 2. Récupérer ses cours
    const [courses] = await connection.query(
      `SELECT id, title, description, createdAt 
       FROM courses 
       WHERE teacherId = ?
       ORDER BY createdAt DESC`,
      [teacher.id]
    );

    if (courses.length === 0) {
      console.log("⚠️  Aucun cours trouvé pour cet enseignant");
      console.log(
        "   Veuillez d'abord créer des cours avant de planifier des sessions.\n"
      );
      await connection.end();
      return;
    }

    console.log(`✅ ${courses.length} cours trouvé(s):`);
    courses.forEach((c, index) => {
      console.log(`   ${index + 1}. [ID: ${c.id}] ${c.title}`);
    });
    console.log("");

    // 3. Vérifier les sessions existantes
    const [existingSessions] = await connection.query(
      `SELECT COUNT(*) as count FROM course_schedule WHERE teacher_id = ?`,
      [teacher.id]
    );

    console.log(`📊 Sessions existantes: ${existingSessions[0].count}\n`);

    // 4. Créer des sessions de planning variées pour chaque cours
    const now = new Date();
    const sessions = [];
    const typeEmojis = {
      lecture: "📚",
      lab: "💻",
      exam: "📝",
      office_hours: "🕐",
    };

    // Templates de sessions
    const sessionTemplates = [
      {
        title: "Introduction et concepts fondamentaux",
        description:
          "Présentation du cours, objectifs pédagogiques et introduction aux concepts de base. Apportez de quoi prendre des notes.",
        type: "lecture",
        duration: 90,
        location: "Amphithéâtre A",
        daysOffset: 2,
        hour: 9,
      },
      {
        title: "Travaux pratiques - Exercices guidés",
        description:
          "Mise en pratique des concepts vus en cours. Apportez votre ordinateur portable avec les logiciels installés.",
        type: "lab",
        duration: 120,
        location: "Salle informatique B101",
        daysOffset: 5,
        hour: 14,
      },
      {
        title: "Permanence - Questions/Réponses",
        description:
          "Session de questions-réponses pour clarifier les points difficiles. Préparez vos questions à l'avance.",
        type: "office_hours",
        duration: 60,
        location: "Bureau C205",
        daysOffset: 7,
        hour: 10,
      },
      {
        title: "Cours avancé - Approfondissement",
        description:
          "Exploration des concepts avancés et des cas d'usage complexes. Prérequis: avoir suivi le cours d'introduction.",
        type: "lecture",
        duration: 90,
        location: "Amphithéâtre B",
        daysOffset: 9,
        hour: 11,
      },
      {
        title: "Projet pratique en groupe",
        description:
          "Travail collaboratif sur un projet réel. Formation des groupes et distribution des sujets.",
        type: "lab",
        duration: 150,
        location: "Salle de projet D301",
        daysOffset: 12,
        hour: 13,
      },
      {
        title: "Évaluation des compétences",
        description:
          "Examen pratique pour évaluer les compétences acquises. Durée: 2h. Documents autorisés.",
        type: "exam",
        duration: 120,
        location: "Salle d'examen E201",
        daysOffset: 16,
        hour: 9,
      },
    ];

    // Créer des sessions pour chaque cours
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];

      for (const template of sessionTemplates) {
        const sessionDate = new Date(now);
        sessionDate.setDate(
          sessionDate.getDate() + template.daysOffset + i * 2
        );
        sessionDate.setHours(template.hour, 0, 0, 0);

        sessions.push({
          course_id: course.id,
          course_title: course.title,
          teacher_id: teacher.id,
          title: template.title,
          description: template.description,
          scheduled_date: sessionDate
            .toISOString()
            .slice(0, 19)
            .replace("T", " "),
          duration_minutes: template.duration,
          location: template.location,
          type: template.type,
        });
      }
    }

    // 5. Insérer les sessions
    console.log(`🔄 Insertion de ${sessions.length} sessions de planning...\n`);

    let insertedCount = 0;
    for (const session of sessions) {
      try {
        const [result] = await connection.query(
          `INSERT INTO course_schedule 
           (course_id, teacher_id, title, description, scheduled_date, duration_minutes, location, type, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')`,
          [
            session.course_id,
            session.teacher_id,
            session.title,
            session.description,
            session.scheduled_date,
            session.duration_minutes,
            session.location,
            session.type,
          ]
        );

        insertedCount++;
        const sessionDate = new Date(session.scheduled_date);

        console.log(
          `${typeEmojis[session.type]} Session ${insertedCount}/${
            sessions.length
          } créée (ID: ${result.insertId})`
        );
        console.log(`   Cours: ${session.course_title}`);
        console.log(`   Type: ${session.type}`);
        console.log(`   Titre: ${session.title}`);
        console.log(
          `   Date: ${sessionDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            hour: "2-digit",
            minute: "2-digit",
          })}`
        );
        console.log(`   Durée: ${session.duration_minutes} min`);
        console.log(`   Lieu: ${session.location}`);
        console.log("");
      } catch (err) {
        console.error(`   ❌ Erreur insertion: ${err.message}`);
      }
    }

    // 6. Récupérer le nombre total de sessions
    const [totalSessions] = await connection.query(
      `SELECT COUNT(*) as count FROM course_schedule WHERE teacher_id = ?`,
      [teacher.id]
    );

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ INSERTION TERMINÉE AVEC SUCCÈS !");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`👤 Enseignant: ${teacher.first_name} ${teacher.last_name}`);
    console.log(`📧 Email: ${teacher.email}`);
    console.log(`📚 Cours: ${courses.length}`);
    console.log(`➕ Sessions ajoutées: ${insertedCount}`);
    console.log(`📊 Total sessions: ${totalSessions[0].count}`);
    console.log("═══════════════════════════════════════════════════════\n");

    // 7. Afficher les 10 prochaines sessions
    const [upcoming] = await connection.query(
      `SELECT cs.*, c.title as course_title,
       (SELECT COUNT(DISTINCT student_id) FROM course_enrollments 
        WHERE course_id = cs.course_id AND status = 'active') as students_count
       FROM course_schedule cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.teacher_id = ? AND cs.scheduled_date >= NOW() AND cs.status = 'scheduled'
       ORDER BY cs.scheduled_date ASC
       LIMIT 10`,
      [teacher.id]
    );

    if (upcoming.length > 0) {
      console.log("📅 LES 10 PROCHAINES SESSIONS:");
      console.log("───────────────────────────────────────────────────────");
      upcoming.forEach((s, index) => {
        const date = new Date(s.scheduled_date);

        console.log(`\n${index + 1}. ${typeEmojis[s.type]} ${s.course_title}`);
        console.log(`   ${s.title}`);
        console.log(
          `   📆 ${date.toLocaleDateString("fr-FR", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`
        );
        console.log(
          `   🕐 ${date.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })} (${s.duration_minutes} min)`
        );
        console.log(`   📍 ${s.location}`);
        console.log(`   👥 ${s.students_count} étudiant(s) inscrit(s)`);
      });
      console.log("\n───────────────────────────────────────────────────────");
    }

    console.log(
      "\n✨ Le planning est maintenant visible dans le dashboard enseignant !"
    );
    console.log("🔗 Connectez-vous avec: ghofranesebteoui@gmail.com\n");
  } catch (error) {
    console.error("\n❌ ERREUR:", error.message);
    console.error("Stack:", error.stack);
    throw error;
  } finally {
    await connection.end();
    console.log("🔌 Connexion fermée\n");
  }
}

// Exécuter le script
insertScheduleForGhofrane().catch((err) => {
  console.error("Échec de l'insertion:", err);
  process.exit(1);
});
