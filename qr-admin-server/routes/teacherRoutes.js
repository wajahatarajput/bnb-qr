// teacherRoutes.js
const express = require('express');
const { Teacher, User } = require('../schemas');
const { jwtMiddleware } = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Teacher'
 *       500:
 *         description: Server Error
 */
router.get('/api/teachers', jwtMiddleware, async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('user');
        res.status(200).send(teachers);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/teachers/{id}:
 *   get:
 *     summary: Get a teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The teacher ID
 *     responses:
 *       200:
 *         description: Teacher retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server Error
 */
router.get('/api/teachers/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher
        const teacher = await Teacher.findById(id).populate('user');

        if (!teacher) {
            return res.status(404).send({ message: 'Teacher not found' });
        }
        res.send(teacher);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/teachers:
 *   post:
 *     summary: Create a new teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       201:
 *         description: Teacher created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       500:
 *         description: Server Error
 */
router.post('/api/teachers', jwtMiddleware, async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const teacherObject = {
            user: user._id,
            courses: []
        }
        const teacher = new Teacher(teacherObject);
        await teacher.save();
        res.status(201).send(teacher);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/teachers/courses:
 *   post:
 *     summary: Get all courses of a teacher
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The user ID of the teacher
 *     responses:
 *       201:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server Error
 */
router.post('/api/teachers/courses', async (req, res) => {
    try {
        const { id } = req.body;
        // Find the teacher based on the user ID and populate the courses field
        const teacher = await Teacher.findOne({ user: id }).populate('courses');

        if (!teacher) {
            return res.status(404).send({ success: false, message: 'Teacher not found' });
        }
        const courses = teacher.courses;
        res.status(201).send(courses);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/teachers/{id}:
 *   put:
 *     summary: Update a teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Teacher'
 *     responses:
 *       200:
 *         description: Teacher updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server Error
 */
router.put('/api/teachers/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Find the teacher
        const teacher = await Teacher.findById(id);
        const user = teacher.user;

        // Update the user information
        await User.findByIdAndUpdate(user._id, {
            username: updates.username,
            password: updates.password,
            first_name: updates.first_name,
            last_name: updates.last_name
        });

        // Update the teacher information
        const options = { new: true }; // To return the updated document
        const updatedTeacher = await Teacher.findByIdAndUpdate(id, updates, options);

        if (!updatedTeacher) {
            return res.status(404).send({ message: 'Teacher not found' });
        }

        res.send(updatedTeacher);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/teachers/{id}:
 *   delete:
 *     summary: Delete a teacher by ID
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The teacher ID
 *     responses:
 *       200:
 *         description: Teacher and associated user deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server Error
 */
router.delete('/api/teachers/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher and delete it
        const teacher = await Teacher.findByIdAndDelete(id);

        if (!teacher) {
            return res.status(404).send({ message: 'Teacher not found' });
        }

        // Find the user associated with the teacher
        const user = await User.findOneAndDelete(teacher.user);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.send({ message: 'Teacher and associated user deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
