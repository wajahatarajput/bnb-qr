const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { User, Student, Teacher, Course, Session, Attendance } = require('./schemas');
const { jwtMiddleware } = require('./middleware');
const socketIO = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const PORT = process.env.PORT || 5000;

const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'BNB QR Attendance Management System with Geolocation API',
            version: '1.0.0',
            description: 'BNB QR Attendance Management System with Geolocation API covered Create, Read, Update, and Delete operations using a Node.js API',
        },
        servers: [
            { url: `http://localhost:${PORT}/` },
        ],
    },
    apis: ['./server.js'], // Adjust this path if your routes are in different files
};

const specs = swaggerJsdoc(swaggerOptions);

mongoose.connect('mongodb://localhost:27017/bnb_attendance_system', { useNewUrlParser: true, useUnifiedTopology: true, family: 4 });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

const app = express();
const server = http.createServer(app);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
app.use(bodyParser.json());
app.use(cors({
    origin: '*', // Allows requests from all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - role
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [admin, student, teacher]
 *         first_name:
 *           type: string
 *         last_name:
 *           type: string
 *     Student:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the student
 *         user:
 *           type: string
 *         courses:
 *           type: array
 *           items:
 *             type: string
 *     Teacher:
 *       type: object
 *       required:
 *         - user
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the teacher
 *         user:
 *           type: string
 *         courses:
 *           type: array
 *           items:
 *             type: string
 *     Course:
 *       type: object
 *       required:
 *         - course_code
 *         - course_name
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the course
 *         course_code:
 *           type: string
 *         course_name:
 *           type: string
 *         students:
 *           type: array
 *           items:
 *             type: string
 *     Session:
 *       type: object
 *       required:
 *         - geoLocation
 *         - course
 *         - roomNumber
 *         - teacher
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the session
 *         geoLocation:
 *           type: string
 *         course:
 *           type: string
 *           description: Reference to the course (Course ID)
 *         roomNumber:
 *           type: string
 *         teacher:
 *           type: string
 *           description: Reference to the teacher (Teacher ID)
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: The start time of the session
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: The end time of the session
 *     Attendance:
 *       type: object
 *       required:
 *         - session
 *         - student
 *         - isPresent
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the attendance record
 *         session:
 *           type: string
 *           description: Reference to the session (Session ID)
 *         student:
 *           type: string
 *           description: Reference to the student (Student ID)
 *         isPresent:
 *           type: boolean
 *           description: Indicates if the student was present
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: The time the attendance was recorded
 */


/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and search
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The search term to filter users by username
 *     responses:
 *       200:
 *         description: A list of users with pagination data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       500:
 *         description: Internal Server Error
 */
app.get('/api/users', jwtMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const pageSize = parseInt(limit, 10);
        const currentPage = parseInt(page, 10);

        // Fetch all users with search filter applied
        const query = search ? { username: { $regex: search, $options: 'i' } } : {};

        const allUsers = await User.find(query).exec();

        // Apply pagination
        const totalUsers = allUsers.length;
        const totalPages = Math.ceil(totalUsers / pageSize);

        const usersToSend = allUsers
            .slice((currentPage - 1) * pageSize, currentPage * pageSize);

        res.status(200).json({
            users: usersToSend,
            totalPages,
            currentPage,
            pageSize,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Internal Server Error
 */
app.get('/api/users', jwtMiddleware, async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).send(users);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
app.get('/api/users/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
app.put('/api/users/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal Server Error
 */
app.delete('/api/users/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});

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
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username, password, role });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password or you must not have access to this app contact the admin" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'bnb_aatika');

        res.status(200).json({ token, id: user?._id, username: user.username, first_name: user.first_name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
});


/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Get all students with pagination and search
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of students per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The search term to filter students by username
 *     responses:
 *       200:
 *         description: A list of students with pagination data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 students:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       500:
 *         description: Server Error
 */
app.get('/api/students', jwtMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const pageSize = parseInt(limit, 10);
        const currentPage = parseInt(page, 10);

        // Fetch all students with populated user data
        const allStudents = await Student.find()
            .populate('user')
            .exec();

        // Apply search filter on the fetched data
        const filteredStudents = allStudents.filter(student => {
            const username = student.user.username || '';
            return username.toLowerCase().includes(search.toLowerCase());
        });

        // Apply pagination on the filtered data
        const totalStudents = filteredStudents.length;
        const totalPages = Math.ceil(totalStudents / pageSize);

        const studentsToSend = filteredStudents
            .slice((currentPage - 1) * pageSize, currentPage * pageSize);

        res.status(200).json({
            students: studentsToSend,
            totalPages,
            currentPage,
            pageSize,
        });
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
app.get('/api/students/:id', jwtMiddleware, async (req, res) => {
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
app.post('/api/students', jwtMiddleware, async (req, res) => {
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
app.put('/api/students/:id', jwtMiddleware, async (req, res) => {
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
app.delete('/api/students/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student and delete it
        const student = await Student.findByIdAndDelete(id)

        if (!student) {
            return res.status(404).send({ message: 'Student not found' });
        }

        console.log(student)

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

/**
 * @swagger
 * /api/teachers:
 *   get:
 *     summary: Get all teachers with pagination and search
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of teachers per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The search term to filter teachers by username
 *     responses:
 *       200:
 *         description: A list of teachers with pagination data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teachers:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teacher'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       500:
 *         description: Server Error
 */
app.get('/api/teachers', jwtMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const pageSize = parseInt(limit, 10);
        const currentPage = parseInt(page, 10);

        // Fetch all teachers with populated user data
        const allTeachers = await Teacher.find()
            .populate('user')
            .exec();

        // Apply search filter on the fetched data
        const filteredTeachers = allTeachers.filter(teacher => {
            const username = teacher.user.username || '';
            return username.toLowerCase().includes(search.toLowerCase());
        });

        // Apply pagination on the filtered data
        const totalTeachers = filteredTeachers.length;
        const totalPages = Math.ceil(totalTeachers / pageSize);

        const teachersToSend = filteredTeachers
            .slice((currentPage - 1) * pageSize, currentPage * pageSize);

        res.status(200).json({
            teachers: teachersToSend,
            totalPages,
            currentPage,
            pageSize,
        });
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
app.get('/api/teachers/:id', jwtMiddleware, async (req, res) => {
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
app.post('/api/teachers', jwtMiddleware, async (req, res) => {
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
 *     summary: Get All courses of a teacher
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
app.post('/api/teachers/courses', async (req, res) => {
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
app.put('/api/teachers/:id', jwtMiddleware, async (req, res) => {
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
app.delete('/api/teachers/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher and delete it
        const teacher = await Teacher.findByIdAndDelete(id)

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
// app.get('/api/courses', jwtMiddleware, async (req, res) => {
//     try {
//         const courses = await Course.find();
//         res.status(200).send(courses);
//     } catch (error) {
//         res.status(500).send(error);
//     }
// });
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
app.get('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the course by ID
        const course = await Course.findById({ _id: id })
            .populate('students')
            .populate({
                path: 'sessions',
                populate: {
                    path: 'teacher', // Populate teacher details in the sessions
                    select: 'user courses', // You can select specific fields if necessary
                    populate: {
                        path: 'user', // Populate user details within the teacher
                        select: 'first_name last_name _id'
                    }
                }
            });

        if (!course) {
            return res.status(404).send({ message: 'Course not found' });
        }

        // Extract student IDs
        const studentIds = course.students.map(student => student._id);

        // Find students
        const students = await Student.find({ _id: { $in: studentIds } }).populate('user');

        course.students = students;

        // Find the teacher associated with this course
        const teacher = await Teacher.findOne({ courses: course._id })
            .populate('user', 'username first_name last_name role');

        // Append teacher to course object
        const courseWithTeacher = {
            ...course.toObject(),
            teacher: teacher ? teacher.user : null // Include teacher details if found
        };

        res.send(courseWithTeacher);
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
app.get('/api/coursescode/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        console.log(id)

        // Find the course by ID
        const course = await Course.findOne({ course_code: id }).populate('students');


        if (!course) {
            return res.status(404).send({ message: 'Course not found' });
        }

        // Extract student IDs
        const studentIds = course.students.map(student => student._id);

        // Find students
        const students = await Student.find({ _id: { $in: studentIds } }).populate('user');

        course.students = students;

        res.send(course);
    } catch (error) {
        res.status(500).send(error);
    }
});

/**
 * @swagger
 * /api/courses/reassign/:courseId/:newTeacherId
 *   put:
 *     summary: Reassign a course to a new teacher
 *     description: Remove the course assignment from the old teacher and assign it to a new teacher.
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the course
 *       - in: query
 *         name: newTeacherId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the new teacher
 *     responses:
 *       200:
 *         description: Successfully reassigned the course
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Course reassigned successfully
 *                 course:
 *                   type: object
 *                   description: Updated course details
 *       404:
 *         description: Course or teacher not found
 *       500:
 *         description: Server error
 */
app.put('/api/courses/reassign/:courseId/:newTeacherId', async (req, res) => {
    try {
        const { courseId, newTeacherId } = req.params;

        // Find the course by ID
        const course = await Course.findOne({ _id: courseId });
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Find the current teacher associated with the course
        const currentTeacher = await Teacher.findOne({ courses: courseId });

        if (currentTeacher) {
            // Remove the course from the current teacher's list
            currentTeacher.courses = currentTeacher.courses.filter(course => course.toString() !== courseId);
            await currentTeacher.save();
        }


        console.log(currentTeacher)

        // Find the new teacher by ID
        const newTeacher = await Teacher.findById(newTeacherId);
        console.log(newTeacher)
        if (!newTeacher) {
            return res.status(404).json({ message: 'New teacher not found' });
        }

        // Add the course to the new teacher's list
        newTeacher.courses.push(course._id);
        await newTeacher.save();

        res.status(200).json({
            message: 'Course reassigned successfully',
            course,
            newTeacher: {
                _id: newTeacher._id,
                user: newTeacher.user,
            },
        });
    } catch (error) {
        console.error('Error reassigning course:', error);
        res.status(500).json({ message: 'Server error' });
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
app.post('/api/courses', jwtMiddleware, async (req, res) => {
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
app.put('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Update the course information
        const options = { new: true }; // To return the updated document
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
app.delete('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the course and delete it
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

app.post('/api/sessions', jwtMiddleware, async (req, res) => {
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
app.get('/api/attendance/session/:sessionId', jwtMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Find the session by ID
        const session = await Session.findById(sessionId).exec();

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Count total attendance records for pagination
        const totalRecords = await Attendance.countDocuments({ session: sessionId });

        // Fetch attendance records and populate student details
        const attendanceRecords = await Attendance.find({ session: sessionId })
            .populate({
                path: 'student', // Populate the student field
                select: 'user courses', // Select specific fields you want from the student model
                populate: {
                    path: 'user', // Further populate the user field inside student
                    select: 'first_name last_name username' // Select specific fields from the user model
                }
            })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .exec();

        // Determine if there are more records to paginate
        const hasMore = (page * limit) < totalRecords;

        // Return attendance records with populated student details
        res.json({ attendanceRecords, hasMore });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
app.post('/api/attendance', jwtMiddleware, async (req, res) => {
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
app.get('/api/attendance/student/:studentId', jwtMiddleware, async (req, res) => {
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

app.get('/api/sessions/teacher/:teacherId', jwtMiddleware, async (req, res) => {
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

app.get('/api/sessions', jwtMiddleware, async (req, res) => {
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

app.get('/api/sessions/:id', jwtMiddleware, async (req, res) => {
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

app.put('/api/sessions/:id', jwtMiddleware, async (req, res) => {
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

app.delete('/api/sessions/:id', jwtMiddleware, async (req, res) => {
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
app.get('/api/attendance', jwtMiddleware, async (req, res) => {
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
app.get('/api/attendance/:id', jwtMiddleware, async (req, res) => {
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
app.put('/api/attendance/:id', jwtMiddleware, async (req, res) => {
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
app.delete('/api/attendance/:id', jwtMiddleware, async (req, res) => {
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




// ----------------------------------------------------


/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management endpoints
 */

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

// POST route to assign a course to a teacher
app.post('/assigncourse/:teacherId/:courseId', jwtMiddleware, async (req, res) => {
    const { teacherId, courseId } = req.params;

    try {
        // Check if teacher exists
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: 'Teacher not found' });
        }

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Add course to teacher's courses array
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
app.get('/attendance-history/:userId', jwtMiddleware, async (req, res) => {
    try {
        const { userId } = req.params;

        // Step 1: Find the student by user ID
        const student = await Student.findOne({ user: userId });

        if (!student) {
            return res.status(404).json({ error: 'Student not found' });
        }

        // Step 2: Find all attendance records for the student
        const attendances = await Attendance.find({ student: student._id }).populate('session');

        if (attendances.length === 0) {
            return res.status(404).json({ error: 'No attendances found for this student' });
        }

        // Step 3: Group attendances by session ID
        const sessionAttendanceMap = attendances.reduce((acc, attendance) => {
            const sessionId = attendance.session._id.toString();
            if (!acc[sessionId]) {
                acc[sessionId] = [];
            }
            acc[sessionId].push({
                isPresent: attendance.isPresent,
                fingerprint: attendance.fingerprint,
                student: student._id // or include other student details if needed
            });
            return acc;
        }, {});

        // Step 4: Find all sessions with populated attendance
        const sessions = await Session.find({ _id: { $in: Object.keys(sessionAttendanceMap) } })
            .populate('course')
            .lean(); // .lean() makes it a plain object for easier manipulation

        // Step 5: Embed attendances into each session
        sessions.forEach(session => {
            session.attendances = sessionAttendanceMap[session._id.toString()] || [];
        });

        // Return the sessions with nested attendance records
        res.json(sessions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
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


// POST request to register a student in a course
app.post('/registercourse/:userId/:course_code', jwtMiddleware, async (req, res) => {
    const { userId, course_code } = req.params;
    try {
        // Check if student and course exist
        const user = await User.findById(userId);
        const student = await Student.find({ user });
        const course = await Course.find({ course_code });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the student is already enrolled in the course
        if (course[0]?.students?.includes(student[0]?._id)) {
            return res.status(400).json({ message: "Student is already enrolled in this course" });
        }

        // Update student's courses array with the new course
        student[0].courses.push(course[0]?._id);
        await student[0].save();

        // Update course's students array with the new student
        course[0].students.push(student[0]?._id);
        await course[0].save();

        res.status(200).json({ message: "Student registered in the course successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


const io = socketIO(server, {
    cors: {
        origin: "*",  // Replace with the origin of your client app
        methods: ["GET", "POST", 'PUT', 'DELETE']
    }
});  // Create a Socket.IO server instance


io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('markAttendance', async (data) => {
        try {
            const { sessionId, studentId, isPresent, fingerprint } = data;

            // Find the session and student
            const session = await Session.findById(sessionId);
            const student = await Student.findOne({ user: studentId });

            if (!session || !student) {
                throw new Error('Invalid session or student ID');
            }

            // Check if attendance has already been marked with the same fingerprint for this session
            let existingAttendance = await Attendance.findOne({ session: sessionId, fingerprint });

            if (existingAttendance) {
                // If attendance is already marked with this fingerprint, do not allow it to be marked again
                socket.emit('fingerprintFound', { session: sessionId, student: studentId, status: false, message: 'Attendance already marked with this fingerprint' });
                console.log('Attendance already marked for this fingerprint');
                return;
            }

            // Check if attendance has already been marked for this student in this session
            let attendance = await Attendance.findOne({ session: sessionId, student: student._id });

            if (attendance && attendance.isPresent) {
                socket.emit('attendanceMarked', { session: sessionId, student: studentId, status: false, message: 'Attendance already marked' });
                console.log('Attendance already marked for this student');
                return;
            }

            // If attendance has not been marked, create a new record or update the existing one
            if (!attendance) {
                attendance = new Attendance({ session: sessionId, student: student._id, fingerprint });
            } else {
                attendance.fingerprint = fingerprint; // Update fingerprint if needed
            }

            // Update the attendance status
            attendance.isPresent = isPresent;

            // Save the attendance
            await attendance.save();

            // Emit the updated attendance status to all clients
            io.emit('attendanceMarked', { session: sessionId, student: studentId, status: true });
        } catch (error) {
            console.error('Error marking attendance:', error);
            socket.emit('attendanceMarked', { session: sessionId, student: studentId, status: false, message: 'Error marking attendance' });
        }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


//-----------------------------------------------------------------------------------------------

// Function to create a default admin user
async function createDefaultAdmin() {
    try {
        // Check if an admin user already exists
        const existingAdmin = await User.findOne({ username: '053-16-0029' });
        if (existingAdmin) {
            console.log('An admin user already exists.');
            return;
        }

        // Create a new admin user
        const defaultAdmin = new User({
            username: '053-16-0029',
            password: '123456', // hash the password
            role: 'admin',
            first_name: 'Admin',
            last_name: 'User'
        });

        // Save the new admin user to the database
        await defaultAdmin.save();
        console.log('Default admin user created successfully.');
    } catch (error) {
        console.error('Error creating default admin user:', error);
    }
}

// Create the default admin user
createDefaultAdmin();


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
app.get('/studentcourses/:studentId', jwtMiddleware, async (req, res) => {
    const { studentId } = req.params;
    console.log(studentId)
    const student = await Student.find({ user: studentId }).populate('courses');
    res.send(student || []);
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
app.put('/studentcourses', jwtMiddleware, async (req, res) => {
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
app.delete('/studentcourses', jwtMiddleware, async (req, res) => {
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
app.get('/api/studentcourses/:studentId', jwtMiddleware, async (req, res) => {
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
app.get('/api/studentattendance/:studentId/:courseId', async (req, res) => {
    try {
        const { studentId, courseId } = req.params;
        console.log(req.params);

        // Find the student by studentId
        const student = await Student.find({ user: studentId });

        // Check if the student exists
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        // Find attendance records for this student in the specific course
        const attendance = await Attendance.find({
            student: student[0]?._id?.toString()
        }).
            populate({
                path: 'session',
                match: { course: courseId },
            });
        // Log attendance for debugging
        console.log('Attendance:', attendance);

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
app.get('/api/teachercourses/:teacherId', async (req, res) => {
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
 *     summary: Get all courses with pagination and optional search
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: The page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: The number of courses per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: The search term to filter courses by name
 *     responses:
 *       200:
 *         description: A list of courses with pagination data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 courses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       department:
 *                         type: string
 *                       totalStudents:
 *                         type: integer
 *                       totalSessions:
 *                         type: integer
 *                       attendanceAverage:
 *                         type: number
 *                         format: float
 *                       teacher:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           first_name:
 *                             type: string
 *                           last_name:
 *                             type: string
 *                           role:
 *                             type: string
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 pageSize:
 *                   type: integer
 *       500:
 *         description: Server error
 */
app.get('/api/courses', jwtMiddleware, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;

        const pageSize = parseInt(limit, 10);
        const currentPage = parseInt(page, 10);

        // Apply search filter
        const query = search ? { name: { $regex: search, $options: 'i' } } : {};

        // Total count for pagination
        const totalCourses = await Course.countDocuments(query);
        const totalPages = Math.ceil(totalCourses / pageSize);

        // Fetch courses with pagination and search filter
        const courses = await Course.find(query)
            .populate({
                path: 'students',
                select: 'user' // Optionally populate only the user field for students
            })
            .populate({
                path: 'sessions',
                populate: {
                    path: 'teacher', // Populate the teacher field within sessions
                    populate: {
                        path: 'user', // Populate user within teacher
                        select: 'username first_name last_name role' // Adjust fields as needed
                    }
                }
            })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize)
            .exec();

        // Calculate additional details
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

            // Find the teacher associated with this course
            const teacher = await Teacher.findOne({ courses: course._id })
                .populate('user', 'username first_name last_name role');

            return {
                ...course.toObject(),
                totalStudents,
                totalSessions,
                attendanceAverage,
                teacher: teacher ? teacher.user : null // Append teacher details if found
            };
        }));

        res.json({
            courses: courseDetails,
            totalPages,
            currentPage,
            pageSize
        });
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
app.get('/api/courses/:id/history', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 3 } = req.query;

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

        res.json({ course, sessionDetails, hasMore });
    } catch (err) {
        res.status(500).json({ message: err.message });
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
app.post('/finishSession/:sessionId', async (req, res) => {
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
app.put('/updateAttendance', async (req, res) => {
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

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------



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
app.put('/api/attendance/modify/:sessionId/:studentId', async (req, res) => {
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


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------



server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});


/**
 * @swagger
 * /api/listteachers:
 *   get:
 *     summary: Get all teachers
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all teachers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   first_name:
 *                     type: string
 *                   last_name:
 *                     type: string
 *                   status:
 *                     type: string
 *                   joiningDate:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Server error
 */
app.get('/api/listteachers', jwtMiddleware, async (req, res) => {
    try {
        const teachers = await Teacher.find()
            .populate('user', 'first_name last_name') // Populating user details
            .exec();

        res.json(teachers);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/**
 * @swagger
 * /api/listcourses:
 *   get:
 *     summary: Get all courses
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of all courses
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   name:
 *                     type: string
 *                   department:
 *                     type: string
 *                   course_code:
 *                     type: string
 *                   totalStudents:
 *                     type: integer
 *                   totalSessions:
 *                     type: integer
 *       500:
 *         description: Server error
 */
app.get('/api/listcourses', jwtMiddleware, async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('students')
            .populate('sessions')
            .exec();

        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

