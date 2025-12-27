const mysql = require("mysql2/promise");
require("dotenv").config();

async function testCoursesAPI() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
  });

  try {
    console.log("═══════════════════════════════════════════════════════");
    console.log("🔍 TEST DE L'API DES COURS");
    console.log("═══════════════════════════════════════════════════════\n");

    // 1. Trouver l'enseignante
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

    // 2. Vérifier les cours
    const [courses] = await connection.query(
      `SELECT c.*, u.first_name, u.last_name,
       (SELECT COUNT(*) FROM course_contents WHERE course_id = c.id) as contents_count,
       (SELECT COUNT(DISTINCT student_id) FROM course_enrollments WHERE course_id = c.id AND status = 'active') as students_count
       FROM courses c 
       JOIN users u ON c.teacherId = u.id 
       WHERE c.teacherId = ? 
       ORDER BY c.createdAt DESC`,
      [teacher.id]
    );

    console.log(`📚 COURS TROUVÉS: ${courses.length}\n`);

    if (courses.length === 0) {
      console.log("⚠️  Aucun cours trouvé pour cet enseignant");
      console.log("   Cela explique pourquoi le dashboard est vide.\n");
    } else {
      courses.forEach((course, index) => {
        console.log(`${index + 1}. [ID: ${course.id}] ${course.title}`);
        console.log(`   Description: ${course.description || "Aucune"}`);
        console.log(
          `   Créé le: ${new Date(course.createdAt).toLocaleDateString(
            "fr-FR"
          )}`
        );
        console.log(`   Contenus: ${course.contents_count}`);
        console.log(`   Étudiants: ${course.students_count}`);
        console.log("");
      });
    }

    // 3. Vérifier la table courses
    const [allCourses] = await connection.query(
      `SELECT id, title, teacherId FROM courses ORDER BY createdAt DESC LIMIT 10`
    );

    console.log(`\n📊 TOUS LES COURS DANS LA BASE: ${allCourses.length}\n`);
    allCourses.forEach((course, index) => {
      console.log(
        `${index + 1}. [ID: ${course.id}] ${course.title} (Enseignant ID: ${
          course.teacherId
        })`
      );
    });

    console.log("\n═══════════════════════════════════════════════════════");
    console.log("✅ TEST TERMINÉ");
    console.log("═══════════════════════════════════════════════════════\n");

    if (courses.length === 0 && allCourses.length > 0) {
      console.log("⚠️  PROBLÈME DÉTECTÉ:");
      console.log(
        "   Des cours existent dans la base mais aucun n'appartient à cet enseignant."
      );
      console.log(
        "   Vérifiez que le teacherId correspond bien à l'ID de l'enseignante.\n"
      );
    }
  } catch (error) {
    console.error("\n❌ ERREUR:", error.message);
    console.error(error.stack);
  } finally {
    await connection.end();
  }
}

testCoursesAPI();
