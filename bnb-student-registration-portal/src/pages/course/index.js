import React, { useEffect, useState } from 'react';
import { useAuth } from '../../providers/AuthProvider';
import { SERVER_URL } from '../../config';
import { server } from '../../helpers';

const StudentCourseHistoryPage = () => {
    const [attendance, setAttendance] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState('');
    const [error, setError] = useState(null);
    const { cookies } = useAuth();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const studentId = cookies.get('id'); // Replace with actual logged-in student ID
                const response = await server.get(`${SERVER_URL}/studentcourses?studentId=${studentId}`);
                setCourses(response.data);
            } catch (err) {
                setError('There was an error fetching the courses.');
                console.error('Error fetching courses:', err);
            }
        };
        fetchCourses();
    }, [cookies]);

    useEffect(() => {
        const fetchAttendance = async () => {
            if (selectedCourse) {
                try {
                    const studentId = cookies.get('id'); // Replace with actual logged-in student ID
                    const response = await server.get(`${SERVER_URL}/studentattendance?studentId=${studentId}&courseId=${selectedCourse}`);
                    setAttendance(response.data);
                } catch (err) {
                    setError('There was an error fetching the attendance.');
                    console.error('Error fetching attendance:', err);
                }
            }
        };
        fetchAttendance();
    }, [selectedCourse, cookies]);

    const handleCourseChange = (e) => {
        setSelectedCourse(e.target.value);
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Course Attendance History</h2>
            {error && <div className="alert alert-danger" role="alert">{error}</div>}
            <div className="mb-3">
                <label htmlFor="courseSelect" className="form-label">Select Course</label>
                <select id="courseSelect" className="form-select" onChange={handleCourseChange}>
                    <option value="">Select a course</option>
                    {courses.map(course => (
                        <option key={course._id} value={course._id}>{course.name}</option>
                    ))}
                </select>
            </div>
            <div className="row">
                <div className="col">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Course Name</th>
                                <th scope="col">Room Number</th>
                                <th scope="col">Date</th>
                                <th scope="col">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.map((record, index) => (
                                <tr key={index}>
                                    <td>{record.courseName}</td>
                                    <td>{record.roomNumber}</td> {/* Display room number */}
                                    <td>{record.date}</td>
                                    <td>{record.status}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentCourseHistoryPage;
