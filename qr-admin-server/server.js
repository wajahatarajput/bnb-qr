const express = require('express');
const mongoose = require('mongoose'); //
const bodyParser = require('body-parser'); // request json handle
const http = require('http');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { User, Student, Teacher, Course, Session } = require('./schemas');
const { jwtMiddleware } = require('./middleware');
const socketIO = require('socket.io');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/bnb_attendance_system', { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log("Connected to MongoDB");
});

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server instance
// const io = require('socket.io')(server);


app.use(bodyParser.json());
app.use(cors());

// REST APIs

// Create user //admin
app.post('/api/users', jwtMiddleware, async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.status(201).send(user);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Get users
app.get('/api/users', jwtMiddleware, async (req, res) => {
    try {
        const users = await User.find();

        res.status(200).send(users);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Get user by ID
app.get('/api/users/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Update user by ID
app.put('/api/users/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.status(200).send(user);
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Delete user by ID
app.delete('/api/users/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndDelete(id);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.status(200).send({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(200).send({ message: "Internal Server Error" });
    }
});

// Login user
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        const user = await User.findOne({ username, password, role });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password or you must not have access to this app contact the admin" });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, 'bnb_aatika');

        res.status(200).json({ token, id: user?._id, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(200).json({ message: "Server Error" });
    }
});

// Get students
app.get('/api/students', jwtMiddleware, async (req, res) => {
    try {
        const students = await Student.find().populate('user');
        res.status(200).send(students);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get student by ID
app.get('/api/students/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student
        const student = await Student.findById(id).populate('user');

        if (!student) {
            return res.status(200).send({ message: 'Student not found' });
        }
        res.send(student);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Create student
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
        res.status(200).send(error);
    }
});

// Update student by ID
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
            return res.status(200).send({ message: 'Student not found' });
        }

        res.send(updatedStudent);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Delete student by ID
app.delete('/api/students/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the student and delete it
        const student = await Student.findByIdAndDelete(id)

        if (!student) {
            return res.status(200).send({ message: 'Student not found' });
        }

        console.log(student)

        // Find the user associated with the student
        const user = await User.findOneAndDelete(student.user);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.send({ message: 'Student and associated user deleted successfully' });
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get teachers
app.get('/api/teachers', jwtMiddleware, async (req, res) => {
    try {
        const teachers = await Teacher.find().populate('user');
        res.status(200).send(teachers);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get teacher by ID
app.get('/api/teachers/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher
        const teacher = await Teacher.findById(id).populate('user');

        if (!teacher) {
            return res.status(200).send({ message: 'Teacher not found' });
        }
        res.send(teacher);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Create teacher
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
        res.status(200).send(error);
    }
});

// Create course
app.post('/api/teachers/courses', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.body;

        // Find the teacher based on the user ID and populate the courses field
        const teacher = await Teacher.findOne({ user: id }).populate('courses');

        if (!teacher) {
            return { success: false, message: 'Teacher not found' };
        }
        const courses = teacher.courses;
        res.status(201).send(courses);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Update teacher by ID
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
            return res.status(200).send({ message: 'Teacher not found' });
        }

        res.send(updatedTeacher);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Delete teacher by ID
app.delete('/api/teachers/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the teacher and delete it
        const teacher = await Teacher.findByIdAndDelete(id)

        if (!teacher) {
            return res.status(200).send({ message: 'Teacher not found' });
        }

        // Find the user associated with the teacher
        const user = await User.findOneAndDelete(teacher.user);

        if (!user) {
            return res.status(200).send({ message: 'User not found' });
        }

        res.send({ message: 'Teacher and associated user deleted successfully' });
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get courses
app.get('/api/courses', jwtMiddleware, async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).send(courses);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Get course by ID
app.get('/api/courses/:id', jwtMiddleware, async (req, res) => {
    // try {
    const { id } = req.params;

    // Find the course
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
    // } catch (error) {
    //     res.status(200).send(error);
    // }
});

// Create course
app.post('/api/courses', jwtMiddleware, async (req, res) => {
    try {
        const course = new Course(req.body);
        await course.save();
        res.status(201).send(course);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Update course by ID
app.put('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        // Update the course information
        const options = { new: true }; // To return the updated document
        const updatedCourse = await Course.findByIdAndUpdate(id, updates, options);

        if (!updatedCourse) {
            return res.status(200).send({ message: 'Course not found' });
        }

        res.send(updatedCourse);
    } catch (error) {
        res.status(200).send(error);
    }
});

// Delete course by ID
app.delete('/api/courses/:id', jwtMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Find the course and delete it
        const course = await Course.findByIdAndDelete(id);

        if (!course) {
            return res.status(200).send({ message: 'Course not found' });
        }

        res.send({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(200).send(error);
    }
});

// Create session
app.post('/api/sessions', jwtMiddleware, async (req, res) => {
    try {
        const { geoLocation, courseId, roomNumber, teacher } = req.body;

        const course = await Course.findOne({ course_code: courseId });

        // If the course is not found
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Find the teacher by teacher ID associated with the course
        const teachers = await Teacher.findOne({ user: teacher });

        // If the teacher is not found
        if (!teachers) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        const session = new Session({
            geoLocation,
            courseId: course,
            roomNumber,
            teacher: teachers
        });
        await session.save();


        await Course.findByIdAndUpdate(course?._id, {
            sessions: session
        });


        res.status(201).send(session);
    } catch (error) {
        res.status(200).send(error);
    }
});


// ----------------------------------------------------

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

const PORT = process.env.PORT || 5000;
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
            // Find the session
            await Session.findByIdAndUpdate(data?.session, {
                attendance: [{
                    student: new mongoose.Types.ObjectId(data?.studentId),
                    isPresent: data?.isPresent
                }]
            }).then(() => {
                io.emit('attendanceUpdated', { studentId: data?.studentId, status: data?.isPresent });
            })
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});


// Start server

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
