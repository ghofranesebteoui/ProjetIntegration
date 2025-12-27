const mysql = require("mysql2/promise");
require("dotenv").config();

async function insertTestConversations() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
  });

  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🚀 CRÉATION DE CONVERSATIONS DE TEST");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Trouver l'enseignante Ghofrane
    const [teachers] = await connection.query(
      `SELECT id, first_name, last_name, email FROM users WHERE email = ?`,
      ["ghofranesebteoui16@gmail.com"]
    );

    if (teachers.length === 0) {
      console.log("❌ Enseignante non trouvée\n");
      await connection.end();
      return;
    }

    const teacher = teachers[0];
    console.log(
      `✅ Enseignante: ${teacher.first_name} ${teacher.last_name} (ID: ${teacher.id})\n`
    );

    // 2. Créer des étudiants de test
    console.log("📝 Création d'étudiants de test...\n");

    const testStudents = [
      {
        first_name: "Ahmed",
        last_name: "Ben Ali",
        email: "ahmed.benali@student.tn",
      },
      {
        first_name: "Sarah",
        last_name: "Trabelsi",
        email: "sarah.trabelsi@student.tn",
      },
      {
        first_name: "Mohamed",
        last_name: "Khalil",
        email: "mohamed.khalil@student.tn",
      },
    ];

    const students = [];
    for (const student of testStudents) {
      // Vérifier si l'étudiant existe déjà
      const [existing] = await connection.query(
        `SELECT id, first_name, last_name, email FROM users WHERE email = ?`,
        [student.email]
      );

      if (existing.length > 0) {
        students.push(existing[0]);
        console.log(
          `✓ Étudiant existant: ${existing[0].first_name} ${existing[0].last_name}`
        );
      } else {
        const [result] = await connection.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, is_verified)
           VALUES (?, '$2a$10$dummyhash', ?, ?, 'student', 1)`,
          [student.email, student.first_name, student.last_name]
        );
        students.push({
          id: result.insertId,
          ...student,
        });
        console.log(
          `✓ Étudiant créé: ${student.first_name} ${student.last_name}`
        );
      }
    }

    console.log(`\n✅ ${students.length} étudiant(s) prêt(s)\n`);

    // 3. Récupérer un cours de l'enseignante
    const [courses] = await connection.query(
      `SELECT id, title FROM courses WHERE teacherId = ? LIMIT 1`,
      [teacher.id]
    );

    const courseId = courses.length > 0 ? courses[0].id : null;

    // 4. Créer des conversations et messages
    console.log("💬 Création des conversations et messages...\n");

    const messageTemplates = [
      {
        student: 0,
        messages: [
          {
            from: "student",
            text: "Bonjour Madame, j'ai une question sur le cours de React.",
          },
          {
            from: "teacher",
            text: "Bonjour Ahmed ! Je vous écoute, quelle est votre question ?",
          },
          {
            from: "student",
            text: "Je ne comprends pas bien la différence entre useState et useEffect.",
          },
          {
            from: "teacher",
            text: "useState gère l'état local, useEffect gère les effets de bord. Je peux vous expliquer en détail demain.",
          },
        ],
      },
      {
        student: 1,
        messages: [
          {
            from: "student",
            text: "Bonjour, est-ce que le TP de la semaine prochaine est obligatoire ?",
          },
          {
            from: "teacher",
            text: "Bonjour Sarah ! Oui, tous les TPs sont obligatoires pour valider le module.",
          },
        ],
      },
      {
        student: 2,
        messages: [
          {
            from: "student",
            text: "Madame, pouvez-vous m'envoyer les slides du dernier cours ?",
          },
        ],
      },
    ];

    for (let i = 0; i < messageTemplates.length; i++) {
      const template = messageTemplates[i];
      const student = students[template.student];

      // Vérifier si la conversation existe déjà
      const [existingConv] = await connection.query(
        `SELECT id FROM conversations WHERE teacher_id = ? AND student_id = ?`,
        [teacher.id, student.id]
      );

      let conversationId;
      if (existingConv.length > 0) {
        conversationId = existingConv[0].id;
        console.log(
          `✓ Conversation existante avec ${student.first_name} ${student.last_name}`
        );
      } else {
        // Créer la conversation
        const [convResult] = await connection.query(
          `INSERT INTO conversations (teacher_id, student_id, course_id, last_message_at)
           VALUES (?, ?, ?, NOW())`,
          [teacher.id, student.id, courseId]
        );
        conversationId = convResult.insertId;
        console.log(
          `✓ Conversation créée avec ${student.first_name} ${student.last_name}`
        );
      }

      // Créer les messages
      for (let j = 0; j < template.messages.length; j++) {
        const msg = template.messages[j];
        const senderId = msg.from === "teacher" ? teacher.id : student.id;
        const receiverId = msg.from === "teacher" ? student.id : teacher.id;
        const isRead = msg.from === "student" ? false : true; // Messages des étudiants non lus

        await connection.query(
          `INSERT INTO messages (conversation_id, sender_id, receiver_id, message, is_read, created_at)
           VALUES (?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL ? MINUTE))`,
          [
            conversationId,
            senderId,
            receiverId,
            msg.text,
            isRead,
            (template.messages.length - j) * 5,
          ]
        );
      }

      console.log(`  → ${template.messages.length} message(s) ajouté(s)\n`);
    }

    // 5. Statistiques
    const [convCount] = await connection.query(
      `SELECT COUNT(*) as count FROM conversations WHERE teacher_id = ?`,
      [teacher.id]
    );

    const [msgCount] = await connection.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.teacher_id = ?`,
      [teacher.id]
    );

    const [unreadCount] = await connection.query(
      `SELECT COUNT(*) as count FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE c.teacher_id = ? AND m.receiver_id = ? AND m.is_read = FALSE`,
      [teacher.id, teacher.id]
    );

    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ CONVERSATIONS CRÉÉES AVEC SUCCÈS !");
    console.log("═══════════════════════════════════════════════════════");
    console.log(`👤 Enseignant: ${teacher.first_name} ${teacher.last_name}`);
    console.log(`💬 Conversations: ${convCount[0].count}`);
    console.log(`📨 Messages totaux: ${msgCount[0].count}`);
    console.log(`🔔 Messages non lus: ${unreadCount[0].count}`);
    console.log("═══════════════════════════════════════════════════════\n");

    console.log(
      "✨ La messagerie est maintenant accessible dans le dashboard !\n"
    );
  } catch (error) {
    console.error("\n❌ ERREUR:", error.message);
    console.error(error.stack);
    throw error;
  } finally {
    await connection.end();
  }
}

insertTestConversations();
