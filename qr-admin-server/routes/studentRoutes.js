// studentRoutes.js
const express = require('express');
const { Student, User } = require('../schemas');
const { jwtMiddleware } = require('../middleware');

const router = express.Router();

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Student'
 *       500:
 *         description: Server Error
 */
router.get('/api/students', jwtMiddleware, async (req, res) => {
    try {
        const students = await Student.find().populate('user');
        res.status(200).send(students);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Get a student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server Error
 */
router.get('/api/students/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student
        const student = await Student.findById(id).populate('user');

        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }
        res.send(student);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Create a new student
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       201:
 *         description: Student created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       500:
 *         description: Server Error
 */
router.post('/api/students', jwtMiddleware, async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const studentObject = {
            user: user._id,
            courses: []
        }
        const student = new Student(studentObject);
        await student.save();
        res.status(201).send(student);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Update a student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Student'
 *     responses:
 *       200:
 *         description: Student updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Student'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server Error
 */
router.put('/api/students/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        // Find the student
        const student = await Student.findById(id);
        const user = student.user;

        // Update the user information
        await User.findByIdAndUpdate(user._id, {
            username: updates.username,
            password: updates.password,
            first_name: updates.first_name,
            last_name: updates.last_name
        });

        // Update the student information
        const options = { new: true }; // To return the updated document
        const updatedStudent = await Student.findByIdAndUpdate(id, updates, options);

        if (!updatedStudent) {
            return res.status(404).send({ message: 'Student not found' });
        }

        res.send(updatedStudent);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Delete a student by ID
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The student ID
 *     responses:
 *       200:
 *         description: Student deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server Error
 */
router.delete('/api/students/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student and delete it
        const student = await Student.findByIdAndDelete(id);

        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        console.log(student);

        // Find the user associated with the student
        const user = await User.findOneAndDelete(student.user);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.send({ message: 'Student and associated user deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
