const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkUsers() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "edunova",
  });

  try {
    console.log("Vérification des utilisateurs dans la base...\n");

    // Tous les utilisateurs
    const [allUsers] = await connection.query(
      `SELECT id, first_name, last_name, email, role FROM users ORDER BY role, id`
    );

    if (allUsers.length === 0) {
      console.log("❌ Aucun utilisateur trouvé dans la base de données\n");
    } else {
      console.log(`✅ ${allUsers.length} utilisateur(s) trouvé(s):\n`);

      const byRole = {};
      allUsers.forEach((u) => {
        if (!byRole[u.role]) byRole[u.role] = [];
        byRole[u.role].push(u);
      });

      Object.keys(byRole).forEach((role) => {
        console.log(`\n📋 ${role.toUpperCase()}S (${byRole[role].length}):`);
        byRole[role].forEach((u) => {
          console.log(
            `  • ID: ${u.id} | ${u.first_name} ${u.last_name} | ${u.email}`
          );
        });
      });
    }

    // Vérifier spécifiquement l'email recherché
    console.log("\n\n🔍 Recherche de ghofranesebteoui@gmail.com...");
    const [specific] = await connection.query(
      `SELECT * FROM users WHERE email LIKE '%ghofrane%' OR email LIKE '%sebteoui%'`
    );

    if (specific.length > 0) {
      console.log('✅ Utilisateur(s) trouvé(s) avec "ghofrane" ou "sebteoui":');
      specific.forEach((u) => {
        console.log(
          `  • ID: ${u.id} | ${u.first_name} ${u.last_name} | ${u.email} | Rôle: ${u.role}`
        );
      });
    } else {
      console.log('❌ Aucun utilisateur trouvé avec "ghofrane" ou "sebteoui"');
    }

    // Compter les cours
    const [coursesCount] = await connection.query(
      `SELECT COUNT(*) as count FROM courses`
    );
    console.log(`\n📚 Nombre de cours dans la base: ${coursesCount[0].count}`);

    await connection.end();
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    await connection.end();
  }
}

checkUsers();
