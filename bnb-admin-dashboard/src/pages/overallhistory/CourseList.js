import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Doughnut } from 'react-chartjs-2';
import { server } from '../../helpers';

function CourseList() {
    const [courses, setCourses] = useState([]);

    useEffect(() => {
        server.get('/api/courses')
            .then(response => {
                setCourses(response?.data);
            })
            .catch(error => {
                console.error('Error fetching courses', error);
            });
    }, []);

    const getChartData = (course) => {
        return {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [course?.attendanceAverage || 0, 100 - course.attendanceAverage || 0],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384']
            }]
        };
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Admin Panel - Courses</h1>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Number of Students</th>
                        <th>Number of Sessions</th>
                        <th>Attendance Average (%)</th>
                        <th>Graph</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.length > 0 && courses.map(course => (
                        <tr key={course._id}>
                            <td>{course.name}</td>
                            <td>{course.department}</td>
                            <td>{course.totalStudents}</td>
                            <td>{course.totalSessions}</td>
                            <td>{course?.attendanceAverage?.toFixed(2)}</td>
                            <td>
                                <Doughnut data={getChartData(course)} />
                            </td>
                            <td>
                                <Link to={`/course-history/${course._id}`} className="btn btn-primary">View History</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CourseList;
