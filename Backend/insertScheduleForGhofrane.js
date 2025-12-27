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
    console.log("Connexion à la base de données...\n");

    // 1. Trouver Ghofrane Sebteoui
    const [users] = await connection.query(
      `SELECT id, first_name, last_name, email, role 
       FROM users 
       WHERE (first_name LIKE '%Ghofrane%' OR last_name LIKE '%Sebteoui%') 
       AND role = 'teacher'`
    );

    if (users.length === 0) {
      console.log("❌ Enseignante Ghofrane Sebteoui non trouvée");
      console.log("Recherche de tous les enseignants...\n");

      const [teachers] = await connection.query(
        `SELECT id, first_name, last_name, email FROM users WHERE role = 'teacher'`
      );

      console.log("Enseignants disponibles:");
      teachers.forEach((t) => {
        console.log(
          `  - ID: ${t.id}, Nom: ${t.first_name} ${t.last_name}, Email: ${t.email}`
        );
      });

      await connection.end();
      return;
    }

    const teacher = users[0];
    console.log(
      `✓ Enseignante trouvée: ${teacher.first_name} ${teacher.last_name} (ID: ${teacher.id})`
    );
    console.log(`  Email: ${teacher.email}\n`);

    // 2. Récupérer ses cours
    const [courses] = await connection.query(
      `SELECT id, title, description, createdAt 
       FROM courses 
       WHERE teacherId = ?
       ORDER BY createdAt DESC`,
      [teacher.id]
    );

    if (courses.length === 0) {
      console.log("❌ Aucun cours trouvé pour cet enseignant");
      console.log(
        "Veuillez d'abord créer un cours avant de planifier des sessions.\n"
      );
      await connection.end();
      return;
    }

    console.log(`✓ ${courses.length} cours trouvé(s):`);
    courses.forEach((c) => {
      console.log(`  - ID: ${c.id}, Titre: ${c.title}`);
    });
    console.log("");

    // 3. Créer des sessions de planning pour chaque cours
    const now = new Date();
    const sessions = [];

    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];

      // Session 1: Cours magistral dans 2 jours
      const date1 = new Date(now);
      date1.setDate(date1.getDate() + 2 + i);
      date1.setHours(9, 0, 0, 0);

      sessions.push({
        course_id: course.id,
        teacher_id: teacher.id,
        title: "Introduction et concepts fondamentaux",
        description:
          "Présentation du cours, objectifs pédagogiques et introduction aux concepts de base.",
        scheduled_date: date1.toISOString().slice(0, 19).replace("T", " "),
        duration_minutes: 90,
        location: "Amphithéâtre A",
        type: "lecture",
      });

      // Session 2: TP dans 5 jours
      const date2 = new Date(now);
      date2.setDate(date2.getDate() + 5 + i);
      date2.setHours(14, 0, 0, 0);

      sessions.push({
        course_id: course.id,
        teacher_id: teacher.id,
        title: "Travaux pratiques - Exercices guidés",
        description:
          "Mise en pratique des concepts vus en cours. Apportez votre ordinateur portable.",
        scheduled_date: date2.toISOString().slice(0, 19).replace("T", " "),
        duration_minutes: 120,
        location: "Salle informatique B101",
        type: "lab",
      });

      // Session 3: Permanence dans 7 jours
      const date3 = new Date(now);
      date3.setDate(date3.getDate() + 7 + i);
      date3.setHours(10, 30, 0, 0);

      sessions.push({
        course_id: course.id,
        teacher_id: teacher.id,
        title: "Permanence - Questions/Réponses",
        description:
          "Session de questions-réponses pour clarifier les points difficiles.",
        scheduled_date: date3.toISOString().slice(0, 19).replace("T", " "),
        duration_minutes: 60,
        location: "Bureau C205",
        type: "office_hours",
      });
    }

    // 4. Insérer les sessions
    console.log(`Insertion de ${sessions.length} sessions de planning...\n`);

    for (const session of sessions) {
      const [result] = await connection.query(
        `INSERT INTO course_schedule 
         (course_id, teacher_id, title, description, scheduled_date, duration_minutes, location, type)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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

      const [courseInfo] = await connection.query(
        "SELECT title FROM courses WHERE id = ?",
        [session.course_id]
      );

      console.log(`✓ Session créée (ID: ${result.insertId})`);
      console.log(`  Cours: ${courseInfo[0].title}`);
      console.log(`  Type: ${session.type}`);
      console.log(`  Titre: ${session.title}`);
      console.log(`  Date: ${session.scheduled_date}`);
      console.log(`  Durée: ${session.duration_minutes} minutes`);
      console.log(`  Lieu: ${session.location}`);
      console.log("");
    }

    // 5. Afficher le résumé
    const [scheduleCount] = await connection.query(
      `SELECT COUNT(*) as count FROM course_schedule WHERE teacher_id = ?`,
      [teacher.id]
    );

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ INSERTION TERMINÉE AVEC SUCCÈS !");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`Enseignant: ${teacher.first_name} ${teacher.last_name}`);
    console.log(`Total de sessions planifiées: ${scheduleCount[0].count}`);
    console.log(`Sessions ajoutées: ${sessions.length}`);
    console.log("═══════════════════════════════════════════════════════\n");

    // 6. Afficher les prochaines sessions
    const [upcoming] = await connection.query(
      `SELECT cs.*, c.title as course_title
       FROM course_schedule cs
       JOIN courses c ON cs.course_id = c.id
       WHERE cs.teacher_id = ? AND cs.scheduled_date >= NOW()
       ORDER BY cs.scheduled_date ASC
       LIMIT 10`,
      [teacher.id]
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

      console.log(
        `${index + 1}. ${typeEmoji[s.type]} ${s.course_title} - ${s.title}`
      );
      console.log(
        `   Date: ${date.toLocaleDateString("fr-FR", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })}`
      );
      console.log(`   Lieu: ${s.location}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    throw error;
  } finally {
    await connection.end();
  }
}

insertScheduleForGhofrane();
