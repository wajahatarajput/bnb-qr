const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const http = require('http');
const cors = require('cors');
const { User, Student, Session, Attendance } = require('./schemas');
const socketIO = require('socket.io');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const userRoutes = require('./routes/userRoutes');  // Import the user routes
const authRoutes = require('./routes/authRoutes'); // Import the auth routes
const studentRoutes = require('./routes/studentRoutes'); // Import student routes
const teacherRoutes = require('./routes/teacherRoutes'); // Import teachers routes
const coursesRoutes = require('./routes/courseRoutes'); // Import course routes
const sessionsRoutes = require('./routes/sessionRoutes'); // Import student routes
const attendanceRoutes = require('./routes/attendanceRoutes'); // Import student routes

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
app.use(cors());


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

// ----------------------------------------------------------------------------User Apis-----------------------------------------------------------------------------------------
app.use(userRoutes);  // Register user routes
// ----------------------------------------------------------------------------User Apis-----------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------Auth Apis-----------------------------------------------------------------------------------------
app.use(authRoutes); // Register authentication routes
// ----------------------------------------------------------------------------Auth Apis-----------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------Students Apis-----------------------------------------------------------------------------------------
app.use(studentRoutes); // Register student routes
// ----------------------------------------------------------------------------Students Apis-----------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------Teachers Apis-----------------------------------------------------------------------------------------
app.use(teacherRoutes); // Register teacher routes
// ----------------------------------------------------------------------------Teachers Apis-----------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------Courses Apis-----------------------------------------------------------------------------------------
app.use(coursesRoutes); // Register courses routes
// ----------------------------------------------------------------------------Courses Apis-----------------------------------------------------------------------------------------

// ----------------------------------------------------------------------------Sessions Apis-----------------------------------------------------------------------------------------
app.use(sessionsRoutes); // Register sessions routes
// ----------------------------------------------------------------------------Sessions Apis-----------------------------------------------------------------------------------------


// ----------------------------------------------------------------------------Attendance Apis-----------------------------------------------------------------------------------------
app.use(attendanceRoutes); // Register attendance routes
// ----------------------------------------------------------------------------Attendance Apis-----------------------------------------------------------------------------------------


// ----------------------------------------------------------------------------Socket IO-----------------------------------------------------------------------------------------
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
            // Destructure data for easier access
            const { sessionId, studentId, isPresent } = data;

            // Find the session and student
            const session = await Session.findById(sessionId);
            const student = await Student.find({ user: studentId });

            if (!session || !student) {
                throw new Error('Invalid session or student ID');
            }

            // Find existing attendance or create a new one
            let attendance = await Attendance.findOne({ session: sessionId, student: student._id });

            if (!attendance) {
                attendance = new Attendance({ session: sessionId, student: studentId });
            }

            // Update the attendance status
            attendance.isPresent = isPresent;

            // Save the attendance
            await attendance.save();

            // Emit the updated attendance status to all clients
            io.emit('attendanceMarked', { session: sessionId, student: studentId, status: isPresent });
        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    });
    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// ----------------------------------------------------------------------------Socket IO-----------------------------------------------------------------------------------------


// ------------------------------------------------------------------------------Server Code ------------------------------------------------------------------------------------

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

// ------------------------------------------------------------------------------Server Code ------------------------------------------------------------------------------------


const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});