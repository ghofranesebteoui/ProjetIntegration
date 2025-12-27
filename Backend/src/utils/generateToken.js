const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

/**
 * Génère un token JWT pour l'authentification
 * @param {number} userId - ID de l'utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} role - Rôle de l'utilisateur (etudiant, enseignant, admin)
 * @returns {string} Token JWT signé
 */
const generateToken = (userId, email, role) => {
  if (!userId || !email || !role) {
    throw new Error('userId, email et role sont requis pour générer un token');
  }

  const token = jwt.sign(
    { 
      id: userId,
      email: email,
      role: role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  console.log('🎫 Token généré pour:', { userId, email, role });
  
  return token;
};

/**
 * Génère un token de vérification d'email
 * @returns {string} Token de vérification
 */
const generateVerificationToken = () => {
  return jwt.sign(
    { type: 'verification' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  generateToken,
  generateVerificationToken,
};