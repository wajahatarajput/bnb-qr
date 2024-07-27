// authRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { User } = require('../schemas');

const router = express.Router();

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 id:
 *                   type: string
 *                 username:
 *                   type: string
 *       401:
 *         description: Invalid username or password or unauthorized access
 *       500:
 *         description: Server Error
 */
router.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username, password, role });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password or you must not have access to this app contact the admin" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'bnb_aatika');

        res.status(200).json({ token, id: user._id, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
