const jwt = require('jsonwebtoken');

// JWT Middleware
const jwtMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header is missing or doesn't start with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    // Extract the token part from the Authorization header
    const token = authHeader.split(' ')[1];

    jwt.verify(token, 'bnb_aatika', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        req.user = decoded.userId;
        next();
    });
};


module.exports = {
    jwtMiddleware
}