const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        console.log('🔐 Auth Header:', authHeader ? '✅ Présent' : '❌ Absent'); // Debug

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false,
                message: 'No token provided' 
            });
        }

        const token = authHeader.split(' ')[1];
        console.log('🎫 Token extrait:', token.substring(0, 20) + '...'); // Debug

        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token vérifié pour user:', decoded.id, 'role:', decoded.role); // Debug

        // Attach user info to request
        req.user = decoded;
        
        next();
    } catch (err) {
        console.error('❌ Erreur auth:', err.message); // Debug
        
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false,
                message: 'Token expired' 
            });
        }
        
        return res.status(401).json({ 
            success: false,
            message: 'Invalid token' 
        });
    }
};

module.exports = authMiddleware;