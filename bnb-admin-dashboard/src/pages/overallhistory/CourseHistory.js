import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { server } from '../../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleLeft } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

function CourseHistory() {
    const { id } = useParams();
    const [course, setCourse] = useState(null);
    const [courseHistory, setCourseHistory] = useState([]);

    useEffect(() => {
        try {
            server.get(`/api/courses/${id}/history`)
                .then(response => {
                    if (response?.data) {
                        setCourse(response.data);
                        setCourseHistory(response.data);
                    }
                })
                .catch(error => {
                    toast.error('Error fetching course history', error);
                });
        } catch (error) {
            toast.error("Error fetching course history")
        }
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
        <div className="container m-5">

            <Link to={-1} className="btn btn-outline-secondary border border-0 bg-transparent text-dark mb-4">  <FontAwesomeIcon icon={faArrowAltCircleLeft} /></Link>
            <h1 className="mb-4">Course History</h1>
            {course && (
                <div>
                    <h2>Course: {course.name}</h2>
                    <div className="table-responsive">
                        <table className="table table-striped text-center">
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
                                {courseHistory.length > 0 && courseHistory?.map(session => (
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
                </div>
            )}
        </div>
    );
}

export default CourseHistory;
