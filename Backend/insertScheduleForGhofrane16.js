const mysql = require("mysql2/promise");
require("dotenv").config();

async function insertScheduleForGhofrane16() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
  });

  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀 INSERTION DE PLANNING POUR GHOFRANE SEBTEOUI");
    console.log("   Email: ghofranesebteoui16@gmail.com");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Trouver l'enseignante par email
    const [users] = await connection.query(
      `SELECT id, first_name, last_name, email, role 
       FROM users 
       WHERE email = ?`,
      ["ghofranesebteoui16@gmail.com"]
    );

    if (users.length === 0) {
      console.log(
        "❌ Enseignante avec email ghofranesebteoui16@gmail.com non trouvée\n"
      );
      console.log("🔍 Recherche d'emails similaires...\n");

      const [similar] = await connection.query(
        `SELECT id, first_name, last_name, email, role 
         FROM users 
         WHERE email LIKE '%ghofrane%' OR email LIKE '%sebteoui%'`
      );

      if (similar.length > 0) {
        console.log("📋 Utilisateurs trouvés avec des emails similaires:");
        similar.forEach((u) => {
          console.log(
            `  • ID: ${u.id} | ${u.first_name} ${u.last_name} | ${u.email} | Rôle: ${u.role}`
          );
        });
      } else {
        console.log("❌ Aucun utilisateur similaire trouvé");
      }

      console.log("\n🔍 Liste de TOUS les utilisateurs:");
      const [allUsers] = await connection.query(
        `SELECT id, first_name, last_name, email, role FROM users ORDER BY role, id`
      );

      if (allUsers.length === 0) {
        console.log("❌ La base de données est vide\n");
      } else {
        allUsers.forEach((u) => {
          console.log(
            `  • ID: ${u.id} | ${u.first_name} ${u.last_name} | ${u.email} | Rôle: ${u.role}`
          );
        });
      }

      await connection.end();
      return;
    }

    const teacher = users[0];
    console.log("✅ Enseignante trouvée:");
    console.log(`   👤 Nom: ${teacher.first_name} ${teacher.last_name}`);
    console.log(`   📧 Email: ${teacher.email}`);
    console.log(`   🆔 ID: ${teacher.id}`);
    console.log(`   👔 Rôle: ${teacher.role}\n`);

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
        "   💡 Conseil: Créez d'abord des cours avant de planifier des sessions.\n"
      );
      await connection.end();
      return;
    }

    console.log(`✅ ${courses.length} cours trouvé(s):`);
    courses.forEach((c, index) => {
      console.log(`   ${index + 1}. [ID: ${c.id}] ${c.title}`);
      if (c.description) {
        console.log(
          `      📝 ${c.description.substring(0, 60)}${
            c.description.length > 60 ? "..." : ""
          }`
        );
      }
    });
    console.log("");

    // 3. Vérifier les sessions existantes
    const [existingSessions] = await connection.query(
      `SELECT COUNT(*) as count FROM course_schedule WHERE teacher_id = ?`,
      [teacher.id]
    );

    console.log(
      `📊 Sessions existantes dans le planning: ${existingSessions[0].count}\n`
    );

    // 4. Créer des sessions de planning variées et réalistes
    const now = new Date();
    const sessions = [];
    const typeEmojis = {
      lecture: "📚",
      lab: "💻",
      exam: "📝",
      office_hours: "🕐",
    };

    // Templates de sessions réalistes
    const sessionTemplates = [
      {
        title: "Séance d'introduction",
        description:
          "Présentation du cours, objectifs pédagogiques, modalités d'évaluation et introduction aux concepts fondamentaux.",
        type: "lecture",
        duration: 90,
        location: "Amphithéâtre A",
        daysOffset: 2,
        hour: 9,
        minute: 0,
      },
      {
        title: "Cours magistral - Partie 1",
        description:
          "Développement des concepts théoriques essentiels. Prise de notes recommandée.",
        type: "lecture",
        duration: 90,
        location: "Amphithéâtre B",
        daysOffset: 4,
        hour: 10,
        minute: 30,
      },
      {
        title: "Travaux pratiques guidés",
        description:
          "Mise en pratique des concepts vus en cours. Apportez votre ordinateur portable avec les logiciels requis installés.",
        type: "lab",
        duration: 120,
        location: "Salle informatique B101",
        daysOffset: 6,
        hour: 14,
        minute: 0,
      },
      {
        title: "Permanence hebdomadaire",
        description:
          "Session de questions-réponses. Préparez vos questions à l'avance pour optimiser le temps.",
        type: "office_hours",
        duration: 60,
        location: "Bureau C205",
        daysOffset: 8,
        hour: 10,
        minute: 0,
      },
      {
        title: "Cours magistral - Partie 2",
        description:
          "Approfondissement des concepts et étude de cas pratiques.",
        type: "lecture",
        duration: 90,
        location: "Amphithéâtre A",
        daysOffset: 9,
        hour: 11,
        minute: 0,
      },
      {
        title: "Atelier pratique avancé",
        description:
          "Travail sur des exercices complexes et résolution de problèmes réels.",
        type: "lab",
        duration: 150,
        location: "Salle informatique B102",
        daysOffset: 11,
        hour: 13,
        minute: 30,
      },
      {
        title: "Révision et préparation examen",
        description:
          "Révision des points clés, conseils pour l'examen et dernières questions.",
        type: "lecture",
        duration: 90,
        location: "Amphithéâtre C",
        daysOffset: 13,
        hour: 9,
        minute: 0,
      },
      {
        title: "Examen final",
        description:
          "Évaluation des compétences acquises. Durée: 2h. Documents autorisés: aucun. Calculatrice autorisée.",
        type: "exam",
        duration: 120,
        location: "Salle d'examen E201",
        daysOffset: 16,
        hour: 9,
        minute: 0,
      },
    ];

    // Créer des sessions pour chaque cours
    console.log("🔄 Préparation des sessions...\n");

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];

      for (const template of sessionTemplates) {
        const sessionDate = new Date(now);
        sessionDate.setDate(
          sessionDate.getDate() + template.daysOffset + i * 3
        );
        sessionDate.setHours(template.hour, template.minute, 0, 0);

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
    console.log(`📝 Insertion de ${sessions.length} sessions de planning...\n`);

    let insertedCount = 0;
    let errorCount = 0;

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
        console.log(`   📚 Cours: ${session.course_title}`);
        console.log(`   📋 Titre: ${session.title}`);
        console.log(
          `   📅 Date: ${sessionDate.toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}`
        );
        console.log(
          `   🕐 Heure: ${sessionDate.toLocaleTimeString("fr-FR", {
            hour: "2-digit",
            minute: "2-digit",
          })} (${session.duration_minutes} min)`
        );
        console.log(`   📍 Lieu: ${session.location}`);
        console.log("");
      } catch (err) {
        errorCount++;
        console.error(`   ❌ Erreur insertion session: ${err.message}\n`);
      }
    }

    // 6. Récupérer le nombre total de sessions
    const [totalSessions] = await connection.query(
      `SELECT COUNT(*) as count FROM course_schedule WHERE teacher_id = ?`,
      [teacher.id]
    );

    // 7. Statistiques finales
    console.log("\n═══════════════════════════════════════════════════════");
    console.log("✅ INSERTION TERMINÉE AVEC SUCCÈS !");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`👤 Enseignant: ${teacher.first_name} ${teacher.last_name}`);
    console.log(`📧 Email: ${teacher.email}`);
    console.log(`🆔 ID: ${teacher.id}`);
    console.log(`📚 Nombre de cours: ${courses.length}`);
    console.log(`➕ Sessions ajoutées: ${insertedCount}`);
    console.log(`❌ Erreurs: ${errorCount}`);
    console.log(
      `📊 Total sessions dans le planning: ${totalSessions[0].count}`
    );
    console.log("═══════════════════════════════════════════════════════\n");

    // 8. Afficher les 10 prochaines sessions
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
        const daysUntil = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

        console.log(`\n${index + 1}. ${typeEmojis[s.type]} ${s.course_title}`);
        console.log(`   📋 ${s.title}`);
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
        console.log(`   ⏰ Dans ${daysUntil} jour(s)`);
      });
      console.log("\n───────────────────────────────────────────────────────");
    } else {
      console.log(
        "⚠️  Aucune session à venir (toutes les sessions sont passées)"
      );
    }

    console.log(
      "\n✨ Le planning est maintenant visible dans le dashboard enseignant !"
    );
    console.log("🔗 Connectez-vous avec: ghofranesebteoui16@gmail.com");
    console.log("🌐 URL: http://localhost:3000/login\n");
  } catch (error) {
    console.error("\n❌ ERREUR CRITIQUE:", error.message);
    console.error("📍 Stack trace:", error.stack);
    throw error;
  } finally {
    await connection.end();
    console.log("🔌 Connexion à la base de données fermée\n");
  }
}

// Exécuter le script
console.log("🚀 Démarrage du script d'insertion...\n");
insertScheduleForGhofrane16().catch((err) => {
  console.error("💥 Échec de l'insertion:", err.message);
  process.exit(1);
});
