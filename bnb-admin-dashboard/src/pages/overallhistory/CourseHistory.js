import React, { useState, useEffect, useCallback } from 'react';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchCourseHistory = useCallback(async (page = 1) => {
        try {
            const response = await server.get(`/api/courses/${id}/history`, {
                params: {
                    page,
                    limit: 3
                }
            });
            setCourse(response.data.course);
            setCourseHistory(response.data.sessionDetails);
            setHasMore(response.data.hasMore);
        } catch (error) {
            toast.error(`Error fetching course history: ${error.response?.data?.message || error.message}`);
        }
    }, [id]);

    useEffect(() => {
        fetchCourseHistory(currentPage);
    }, [fetchCourseHistory, currentPage]);

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

    const handlePageChange = (direction) => {
        if (direction === 'next' && hasMore) {
            setCurrentPage(prevPage => prevPage + 1);
        } else if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <div className="container m-5">
            <Link to={-1} className="btn btn-outline-secondary border border-0 bg-transparent text-dark mb-4">
                <FontAwesomeIcon icon={faArrowAltCircleLeft} />
            </Link>
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
                                {courseHistory.length > 0 ? courseHistory.map(session => (
                                    <tr key={session._id}>
                                        <td>{new Date(session.sessionTime).toLocaleString()}</td>
                                        <td>{session.roomNumber}</td>
                                        <td>{session.presentCount}</td>
                                        <td>{session.absentCount}</td>
                                        <td>
                                            <div style={{ width: '150px', height: '150px' }}>
                                                <Doughnut data={getSessionChartData(session)} />
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5">No history available.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="d-flex justify-content-between mt-3">
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => handlePageChange('prev')}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage}</span>
                        <button
                            className="btn btn-outline-primary"
                            onClick={() => handlePageChange('next')}
                            disabled={!hasMore}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CourseHistory;
