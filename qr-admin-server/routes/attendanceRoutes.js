const express = require('express');
const router = express.Router();
const { Student, Course, Attendance } = require('../schemas');
const { jwtMiddleware } = require('../middleware');

/**
 * @swagger
 * tags:
 *   name: Attendance
 *   description: Attendance management endpoints
 */

/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Record attendance for a course
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               course_code:
 *                 type: string
 *               date:
 *                 type: string
 *               students:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     student_id:
 *                       type: string
 *                     status:
 *                       type: string
 *     responses:
 *       201:
 *         description: Attendance recorded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server Error
 */
router.post('/api/attendance', jwtMiddleware, async (req, res) => {
    const { course_code, date, students } = req.body;

    try {
        const course = await Course.findOne({ course_code });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const attendanceRecords = students.map(async (student) => {
            return new Attendance({
                course: course._id,
                student: student.student_id,
                date,
                status: student.status,
            }).save();
        });

        await Promise.all(attendanceRecords);

        res.status(201).json({ message: 'Attendance recorded successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/attendance/{course_code}/{date}:
 *   get:
 *     summary: Get attendance records for a course on a specific date
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: course_code
 *         schema:
 *           type: string
 *         required: true
 *         description: The course code
 *       - in: path
 *         name: date
 *         schema:
 *           type: string
 *         required: true
 *         description: The date of attendance
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Attendance records not found
 *       500:
 *         description: Server Error
 */
router.get('/api/attendance/:course_code/:date', jwtMiddleware, async (req, res) => {
    const { course_code, date } = req.params;

    try {
        const course = await Course.findOne({ course_code });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const records = await Attendance.find({ course: course._id, date });
        res.json(records);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});



/**
 * @swagger
 * /api/attendance:
 *   post:
 *     summary: Create an attendance record
 *     tags: [Attendance]
 *     security: 
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *               studentId:
 *                 type: string
 *               isPresent:
 *                 type: boolean
 *             example:
 *               sessionId: "session_id_here"
 *               studentId: "student_id_here"
 *               isPresent: true
 *     responses:
 *       201:
 *         description: Attendance record created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Session or Student not found
 *       500:
 *         description: Server Error
 */
router.post('/api/attendance', jwtMiddleware, async (req, res) => {
    try {
        const { sessionId, studentId, isPresent } = req.body;

        const session = await Session.findById(sessionId);
        const student = await Student.findById(studentId);

        if (!session || !student) {
            return res.status(404).json({ message: "Session or Student not found" });
        }

        const attendance = new Attendance({
            session: sessionId,
            student: studentId,
            isPresent
        });
        await attendance.save();

        const populatedAttendance = await Attendance.findById(attendance._id).populate('session').populate('student');

        res.status(201).send(populatedAttendance);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/attendance/student/{studentId}:
 *   get:
 *     summary: Get attendance by student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the student
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server Error
 */
router.get('/api/attendance/student/:studentId', jwtMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;

        const student = await Student.findById(studentId);

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        const attendanceRecords = await Attendance.find({ student: studentId }).populate('student').populate('session');

        res.status(200).send(attendanceRecords);
    } catch (error) {
        res.status(500).send(error);
    }
});


/**
 * @swagger
 * /api/attendance:
 *   get:
 *     summary: Get all attendance records
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Attendance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       500:
 *         description: Server Error
 */
router.get('/api/attendance', jwtMiddleware, async (req, res) => {
    try {
        const attendanceRecords = await Attendance.find().populate('student').populate('session');
        res.status(200).send(attendanceRecords);
    } catch (error) {
        res.status(500).send(error);
    }
});


/**
 * @swagger
 * /api/attendance/{id}:
 *   get:
 *     summary: Get an attendance record by ID
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the attendance record
 *     responses:
 *       200:
 *         description: Attendance record retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server Error
 */
router.get('/api/attendance/:id', jwtMiddleware, async (req, res) => {
    try {
        const attendance = await Attendance.findById(req.params.id).populate('session').populate('student');
        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found" });
        }
        res.status(200).send(attendance);
    } catch (error) {
        res.status(500).send(error);
    }
});


/**
 * @swagger
 * /api/attendance/{id}:
 *   put:
 *     summary: Update an attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the attendance record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isPresent:
 *                 type: boolean
 *             example:
 *               isPresent: true
 *     responses:
 *       200:
 *         description: Attendance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server Error
 */
router.put('/api/attendance/:id', jwtMiddleware, async (req, res) => {
    try {
        const { isPresent } = req.body;

        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            { isPresent },
            { new: true }
        ).populate('session').populate('student');

        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        res.status(200).send(attendance);
    } catch (error) {
        res.status(500).send(error);
    }
});


/**
 * @swagger
 * /api/attendance/{id}:
 *   delete:
 *     summary: Delete an attendance record
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the attendance record
 *     responses:
 *       200:
 *         description: Attendance record deleted successfully
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Server Error
 */
router.delete('/api/attendance/:id', jwtMiddleware, async (req, res) => {
    try {
        const attendance = await Attendance.findByIdAndDelete(req.params.id);

        if (!attendance) {
            return res.status(404).json({ message: "Attendance record not found" });
        }

        res.status(200).json({ message: "Attendance record deleted successfully" });
    } catch (error) {
        res.status(500).send(error);
    }
});


/**
 * @swagger
 * /api/attendance-history/{userId}:
 *   get:
 *     summary: Get attendance history for a student
 *     tags: [Attendance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user/student
 *     responses:
 *       200:
 *         description: List of sessions with attendance details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Session'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Server Error
 */
router.get('/attendance-history/:userId', jwtMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;
        const student = await Student.findOne({ user: userId }).populate('courses');

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const sessions = await Session.find({
            'attendance.student': student._id
        }).populate('courseId attendance.student');

        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});



/**
 * @swagger
 * /updateAttendance:
 *   put:
 *     summary: Update attendance for a session
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The ID of the session
 *               attendance:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     studentId:
 *                       type: string
 *                     isPresent:
 *                       type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated attendance
 *       404:
 *         description: Session not found
 *       500:
 *         description: Internal server error
 */
router.put('/updateAttendance', async (req, res) => {
    try {
        const { sessionId, attendance } = req.body;

        // Find the session by ID
        const session = await Session.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Process attendance updates
        const bulkOperations = attendance.map(record => ({
            updateOne: {
                filter: { session: sessionId, student: record.studentId },
                update: { isPresent: record.isPresent },
                upsert: true,
            },
        }));

        if (bulkOperations.length > 0) {
            await Attendance.bulkWrite(bulkOperations);
        }

        res.status(200).json({ message: 'Successfully updated attendance' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


/**
 * @swagger
 * /api/attendance/modify/:sessionId/:studentId
 *   put:
 *     summary: Toggle the attendance status of a student for a session
 *     tags: [Attendance]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: The ID of the session
 *                 example: 60d21b4667d0d8992e610c85
 *               studentId:
 *                 type: string
 *                 description: The ID of the student
 *                 example: 60d21b4967d0d8992e610c86
 *     responses:
 *       200:
 *         description: Attendance status successfully toggled
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 session:
 *                   type: string
 *                 student:
 *                   type: string
 *                 isPresent:
 *                   type: boolean
 *       404:
 *         description: Attendance record not found
 *       500:
 *         description: Internal server error
 */
// changed this api endpoint /api/attendace/toggle to /api/attendance/modify/:sessionId/:studentId where sessionId and studentId are parameters for api
router.put('/api/attendance/modify/:sessionId/:studentId', async (req, res) => {
    const { sessionId, studentId } = req.params;

    // Log the input parameters
    console.log(`Received sessionId: ${sessionId}, studentId: ${studentId}`);

    try {
        const attendance = await Attendance.findOne({
            session: new mongoose.Types.ObjectId(sessionId),
            student: new mongoose.Types.ObjectId(studentId)
        });

        if (!attendance) {
            return res.status(404).send({ message: 'Attendance record not found' });
        }

        attendance.isPresent = !attendance.isPresent;
        await attendance.save();

        res.send(attendance);
    } catch (error) {
        console.error('Error toggling attendance:', error);
        res.status(500).send({ message: 'Internal server error', error });
    }
});



module.exports = router;
