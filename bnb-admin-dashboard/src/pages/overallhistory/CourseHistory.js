import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Doughnut } from 'react-chartjs-2';
import { server } from '../../helpers';

function CourseHistory() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [courseHistory, setCourseHistory] = useState([]);

    useEffect(() => {
        server.get(`/api/courses/${id}/history`)
            .then(response => {
                setCourse(response.data);
                setCourseHistory(response.data);
            })
            .catch(error => {
                console.error('Error fetching course history', error);
            });
    }, [id]);

    const getSessionChartData = (session) => {
        return {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [session.presentCount, session.absentCount],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384']
            }]
        };
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Course History</h1>
            <Link to="/" className="btn btn-secondary mb-4">Back to Courses</Link>
            {course && (
                <div>
                    <h2>Course: {course.name}</h2>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Session Time</th>
                                <th>Room Number</th>
                                <th>Present</th>
                                <th>Absent</th>
                                <th>Graph</th>
                            </tr>
                        </thead>
                        <tbody>
                            {courseHistory.map(session => (
                                <tr key={session._id}>
                                    <td>{new Date(session.sessionTime).toLocaleString()}</td>
                                    <td>{session.roomNumber}</td>
                                    <td>{session.presentCount}</td>
                                    <td>{session.absentCount}</td>
                                    <td>
                                        <Doughnut data={getSessionChartData(session)} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default CourseHistory;
