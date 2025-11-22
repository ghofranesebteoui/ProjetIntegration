// createFirstAdmin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { pool } = require('./src/config/db'); // ← ce chemin est bon si tu as server.js à la racine

async function createAdmin() {
  try {
    const email = 'admin@edunova.com';
    const plainPassword = 'admin123'; // tu pourras le changer après la 1ère connexion
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const sql = `
      INSERT INTO users 
        (email, password_hash, first_name, last_name, role, is_verified, created_at, updated_at)
      VALUES 
        (?, ?, 'Admin', 'eduNova', 'admin', 1, NOW(), NOW())
      ON DUPLICATE KEY UPDATE
        password_hash = VALUES(password_hash),
        first_name = VALUES(first_name),
        last_name = VALUES(last_name),
        role = 'admin',
        is_verified = 1
    `;

    const [result] = await pool.query(sql, [email, hashedPassword]);

    console.log('Premier admin créé / mis à jour avec succès !');
    console.log('Email     : admin@edunova.com');
    console.log('Mot de passe : admin123');
    console.log('Change ce mot de passe dès ta première connexion !');
    
    process.exit(0);
  } catch (err) {
    console.error('Erreur lors de la création de l’admin :', err);
    process.exit(1);
  }
}

createAdmin();