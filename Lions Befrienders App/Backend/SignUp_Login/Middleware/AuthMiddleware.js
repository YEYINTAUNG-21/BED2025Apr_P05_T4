const { allow } = require('joi');
const jwt = require('jsonwebtoken');

function verifyJWT(allowedRoles = []) {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or Invalid Token' });
        }
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (allowedRoles.length && !allowedRoles.includes(decoded.role)) {
                return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
            }
            req.user = decoded;
            next();
        } catch (error) {
            console.error('JWT verification error:', error);
            return res.status(401).json({ message: 'Invalid Token' });
        }
    }
}

module.exports = { 
    verifyJWT 
};