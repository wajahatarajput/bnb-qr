const express = require('express');
const router = express.Router();
const { Student, Course, Teacher, Attendance, User } = require('../schemas');
const { jwtMiddleware } = require('../middleware');

/**
 * @swagger
 * tags:
 *   name: Sessions
 *   description: Sessions management endpoints
 */

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               geoLocations:
 *                 type: array
 *                 items:
 *                   type: string
 *               courseId:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               teacher:
 *                 type: string
 *             example:
 *               geoLocations: ["Location 1"]
 *               courseId: "CSE101"
 *               roomNumber: "Room A"
 *               teacher: "teacher_id_here"
 *     responses:
 *       201:
 *         description: Session created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Course or Teacher not found
 *       500:
 *         description: Server Error
 */

router.post('/api/sessions', jwtMiddleware, async (req, res) => {
    try {
        const { geoLocations, courseId, roomNumber, teacher } = req.body;

        const course = await Course.findOne({ course_code: courseId });

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const teachers = await Teacher.findOne({ user: teacher });

        if (!teachers) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const session = new Session({
            geoLocations,
            course: course._id,
            roomNumber,
            teacher: teachers._id
        });
        await session.save();

        course.sessions.push(session._id);
        await course.save();

        res.status(201).send(session);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/attendance/session/{sessionId}:
 *   get:
 *     summary: Get attendance records by session ID with pagination
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: The session ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number (starting from 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of records per page
 *     responses:
 *       200:
 *         description: A list of attendance records for the session
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   session:
 *                     type: string
 *                   student:
 *                     type: string
 *                   isPresent:
 *                     type: boolean
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get('/api/attendance/session/:sessionId', jwtMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const session = await Session.findById(sessionId).exec();

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const totalRecords = await Attendance.countDocuments({ session: sessionId });
        const attendanceRecords = await Attendance.find({ session: sessionId })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .exec();
        const hasMore = (page * limit) < totalRecords;

        res.json({ attendanceRecords, hasMore });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/**
 * @swagger
 * /api/sessions/teacher/{teacherId}:
 *   get:
 *     summary: Get sessions by teacher
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the teacher
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Server Error
 */
router.get('/api/sessions/teacher/:teacherId', jwtMiddleware, async (req, res) => {
    try {
        const { teacherId } = req.params;

        const teacher = await Teacher.find({ user: teacherId });

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const sessions = await Session.find({ teacher: teacher?._id });

        res.status(200).send(sessions);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all sessions
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       500:
 *         description: Server Error
 */

router.get('/api/sessions', jwtMiddleware, async (req, res) => {
    try {
        const sessions = await Session.find().populate('teacher').populate('course');
        res.status(200).send(sessions);
    } catch (error) {
        res.status(500).send(error);
    }
});


/**
 * @swagger
 * /api/sessions/{id}:
 *   get:
 *     summary: Get a session by ID
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the session
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server Error
 */

router.get('/api/sessions/:id', jwtMiddleware, async (req, res) => {
    try {
        const session = await Session.findById(req.params.id).populate('teacher').populate('course');
        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }
        res.status(200).send(session);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/sessions/{id}:
 *   put:
 *     summary: Update a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               geoLocations:
 *                 type: array
 *                 items:
 *                   type: string
 *               courseId:
 *                 type: string
 *               roomNumber:
 *                 type: string
 *               teacher:
 *                 type: string
 *             example:
 *               geoLocations: ["Location 2"]
 *               courseId: "CSE102"
 *               roomNumber: "Room B"
 *               teacher: "teacher_id_here"
 *     responses:
 *       200:
 *         description: Session updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Session'
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server Error
 */

router.put('/api/sessions/:id', jwtMiddleware, async (req, res) => {
    try {
        const { geoLocations, courseId, roomNumber, teacher } = req.body;

        const course = await Course.findOne({ course_code: courseId });
        const teachers = await Teacher.findOne({ user: teacher });

        if (!course || !teachers) {
            return res.status(404).json({ message: "Course or Teacher not found" });
        }

        const session = await Session.findByIdAndUpdate(
            req.params.id,
            { geoLocations, course: course._id, roomNumber, teacher: teachers._id },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        res.status(200).send(session);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/sessions/{id}:
 *   delete:
 *     summary: Delete a session
 *     tags: [Sessions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the session
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server Error
 */

router.delete('/api/sessions/:id', jwtMiddleware, async (req, res) => {
    try {
        const session = await Session.findByIdAndDelete(req.params.id);

        if (!session) {
            return res.status(404).json({ message: "Session not found" });
        }

        await Course.updateMany({ sessions: session._id }, { $pull: { sessions: session._id } });

        res.status(200).json({ message: "Session deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});


/**
 * @swagger
 * /finishSession/{sessionId}:
 *   post:
 *     summary: Mark absent students for a session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the session
 *     responses:
 *       200:
 *         description: Successfully marked absent students
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */


router.post('/finishSession/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;

        // Find the session by ID
        const session = await Session.findById(sessionId).populate('course');
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Get the course associated with the session
        const course = session.course;

        // Get the list of students registered in the course
        const registeredStudents = await Student.find({ courses: course._id });

        // Get the attendance records for the session
        const attendanceRecords = await Attendance.find({ session: sessionId });

        // Create a set of student IDs who are present
        const presentStudentIds = new Set(attendanceRecords.map(record => record.student.toString()));

        // Iterate through registered students and mark those not present as absent
        const bulkOperations = registeredStudents.map(student => {
            if (!presentStudentIds.has(student._id.toString())) {
                return {
                    updateOne: {
                        filter: { session: sessionId, student: student._id },
                        update: { isPresent: false },
                        upsert: true, // Create the record if it doesn't exist
                    },
                };
            }
            return null;
        }).filter(op => op !== null);

        if (bulkOperations.length > 0) {
            await Attendance.bulkWrite(bulkOperations);
        }

        res.status(200).json({ message: 'Successfully marked absent students' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
