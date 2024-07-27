const express = require('express');
const router = express.Router();
const { Student, Course, Teacher, Attendance, User } = require('../schemas');
const { jwtMiddleware } = require('../middleware');


/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server Error
 */
router.get('/api/courses', jwtMiddleware, async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).send(courses);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get a course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID or course code
 *     responses:
 *       200:
 *         description: Course retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server Error
 */
router.get('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findOne({ course_code: id }).populate('students');

        if (!course) {
            return res.status(404).send({ message: 'Course not found' });
        }

        const studentIds = course.students.map(student => student._id);
        const students = await Student.find({ _id: { $in: studentIds } }).populate('user');

        course.students = students;
        res.send(course);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/courses:
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       500:
 *         description: Server Error
 */
router.post('/api/courses', jwtMiddleware, async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).send(course);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   put:
 *     summary: Update a course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Course'
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Course'
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server Error
 */
router.put('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const options = { new: true };
        const updatedCourse = await Course.findByIdAndUpdate(id, updates, options);

        if (!updatedCourse) {
            return res.status(404).send({ message: 'Course not found' });
        }

        res.send(updatedCourse);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/courses/{id}:
 *   delete:
 *     summary: Delete a course by ID
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The course ID
 *     responses:
 *       200:
 *         description: Course deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server Error
 */
router.delete('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(404).send({ message: 'Course not found' });
        }

        res.send({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/assigncourse/{teacherId}/{courseId}:
 *   post:
 *     summary: Assign a course to a teacher
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the teacher
 *       - in: path
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Course assigned to teacher successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       404:
 *         description: Teacher or Course not found
 *       500:
 *         description: Server Error
 */
router.post('/api/assigncourse/:teacherId/:courseId', jwtMiddleware, async (req, res) => {
    const { teacherId, courseId } = req.params;

    try {
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        teacher.courses.push(courseId);
        await teacher.save();

        res.json({ message: 'Course assigned to teacher successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

/**
 * @swagger
 * /api/registercourse/{userId}/{course_code}:
 *   post:
 *     summary: Register a student in a course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user/student
 *       - in: path
 *         name: course_code
 *         schema:
 *           type: string
 *         required: true
 *         description: The course code
 *     responses:
 *       200:
 *         description: Student registered in the course successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Student is already enrolled in the course
 *       404:
 *         description: Student or Course not found
 *       500:
 *         description: Server Error
 */
router.post('/api/registercourse/:userId/:course_code', jwtMiddleware, async (req, res) => {
    const { userId, course_code } = req.params;
    try {
        const student = await Student.findOne({ user: userId });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const course = await Course.findOne({ course_code });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (student.courses.includes(course._id)) {
            return res.status(400).json({ message: 'Student is already enrolled in this course' });
        }

        student.courses.push(course._id);
        await student.save();

        res.json({ message: 'Student registered in the course successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});


/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Retrieve a list of courses for a student
 *     tags: [Courses]
 *     responses:
 *       200:
 *         description: A list of courses.
 */
router.get('/studentcourses', jwtMiddleware, async (req, res) => {
    const studentId = req.query.studentId;
    const student = await Student.find({ user: studentId }).populate('courses');

    console.log(student)
    res.json(student?.courses || []);
});

/**
 * @swagger
 * /courses:
 *   put:
 *     summary: Update a student's course
 *     tags: [Courses]
 *     parameters:
 *       - name: studentId
 *         description: ID of the student
 *         in: query
 *         required: true
 *       - name: courseId
 *         description: ID of the course
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Course updated successfully.
 */
router.put('/studentcourses', jwtMiddleware, async (req, res) => {
    const { studentId, courseId } = req.query;
    const student = await Student.find(
        { user: studentId }
    );
    if (!student.courses.includes(courseId)) {
        student.courses.push(courseId);
        await student.save();
    }
    res.json(student);
});

/**
 * @swagger
 * /courses:
 *   delete:
 *     summary: Unenroll a student from a course
 *     tags: [Courses]
 *     parameters:
 *       - name: studentId
 *         description: ID of the student
 *         in: query
 *         required: true
 *       - name: courseId
 *         description: ID of the course
 *         in: query
 *         required: true
 *     responses:
 *       200:
 *         description: Course unenrolled successfully.
 */
router.delete('/studentcourses', jwtMiddleware, async (req, res) => {
    const { studentId, courseId } = req.query;
    const student = await Student.find({ user: studentId });
    student.courses = student.courses.filter(id => id.toString() !== courseId);
    await student.save();
    res.json(student);
});



/**
 * @swagger
 * /api/studentcourses/{studentId}:
 *   get:
 *     summary: Get courses assigned to a student
 *     tags: [Student Courses]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student
 *     responses:
 *       200:
 *         description: Successful response with courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Student not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/api/studentcourses/:studentId', jwtMiddleware, async (req, res) => {
    try {
        const { studentId } = req.params;
        const courses = await Course.find({ students: studentId });
        res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/studentattendance/{studentId}/{courseId}:
 *   get:
 *     summary: Get attendance history of a student for a specific course
 *     tags: [Student Attendance]
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the student
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the course
 *     responses:
 *       200:
 *         description: Successful response with attendance records
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Attendance'
 *       404:
 *         description: Student or course not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/api/studentattendance/:studentId/:courseId', jwtMiddleware, async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        const attendance = await Attendance.find({ student: studentId }).populate({
            path: 'session',
            match: { course: courseId },
        });
        res.status(200).json(attendance);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
/**
 * @swagger
 * /api/teachercourses/{teacherId}:
 *   get:
 *     summary: Get courses assigned to a teacher
 *     tags: [Teacher Courses]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the teacher
 *     responses:
 *       200:
 *         description: Successful response with courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Course'
 *       404:
 *         description: Teacher not found
 *       500:
 *         description: Internal Server Error
 */
router.get('/api/teachercourses/:teacherId', async (req, res) => {
    try {
        const { teacherId } = req.params;
        const teacher = await Teacher.find({ user: teacherId }).populate('courses');
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }
        res.status(200).json(teacher.courses);
    } catch (error) {
        console.error('Error fetching teacher courses:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses with the number of students, number of sessions, and attendance average
 *     responses:
 *       200:
 *         description: A list of courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   department:
 *                     type: string
 *                   totalStudents:
 *                     type: integer
 *                   totalSessions:
 *                     type: integer
 *                   attendanceAverage:
 *                     type: number
 *                     format: float
 *       500:
 *         description: Server error
 */
router.get('/api/courses', jwtMiddleware, async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('students')
            .populate('sessions')
            .exec();

        const courseDetails = await Promise.all(courses.map(async (course) => {
            const totalSessions = course.sessions.length;
            const totalStudents = course.students.length;
            let totalAttendance = 0;
            let presentCount = 0;

            for (const session of course.sessions) {
                const attendances = await Attendance.find({ session: session._id }).exec();
                totalAttendance += attendances.length;
                presentCount += attendances.filter(a => a.isPresent).length;
            }

            const attendanceAverage = totalAttendance ? (presentCount / totalAttendance) * 100 : 0;

            return {
                ...course.toObject(),
                totalStudents,
                totalSessions,
                attendanceAverage
            };
        }));

        res.json(courseDetails);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/courses/{id}/history:
 *   get:
 *     summary: Get course history by course ID with pagination
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The course ID
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
 *         description: A list of sessions for the course
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   sessionTime:
 *                     type: string
 *                     format: date-time
 *                   roomNumber:
 *                     type: string
 *                   presentCount:
 *                     type: integer
 *                   absentCount:
 *                     type: integer
 *       404:
 *         description: Course not found
 *       500:
 *         description: Server error
 */
router.get('/api/courses/:id/history', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const course = await Course.findById(id).populate('sessions').exec();

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const totalSessions = course.sessions.length;
        const sessions = course.sessions.slice((page - 1) * limit, page * limit);
        const hasMore = (page * limit) < totalSessions;

        const sessionDetails = await Promise.all(sessions.map(async (session) => {
            const attendances = await Attendance.find({ session: session._id }).exec();
            const presentCount = attendances.filter(a => a.isPresent).length;
            const absentCount = attendances.length - presentCount;

            return {
                ...session.toObject(),
                presentCount,
                absentCount
            };
        }));

        res.json({ sessionDetails, hasMore });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



module.exports = router;
