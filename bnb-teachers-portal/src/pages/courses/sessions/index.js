import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { server } from '../../../helpers';

const CourseSessions = () => {
    const { courseId } = useParams();
    const [sessions, setSessions] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        const fetchSessions = async () => {
            setLoading(true);
            try {
                const response = await server.get(`/api/courses/${courseId}/history`, {
                    params: { page, limit: 10 }
                });
                setSessions(response.data.sessionDetails);
                setHasMore(response.data.hasMore);
            } catch (error) {
                console.error('Error fetching sessions data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, [courseId, page]);

    const handlePrevPage = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Course Sessions</h2>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Session Time</th>
                                <th scope="col">Room Number</th>
                                <th scope="col">Present Count</th>
                                <th scope="col">Absent Count</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sessions.map((session, index) => (
                                <tr key={index}>
                                    <td>{new Date(session.sessionTime).toLocaleString()}</td>
                                    <td>{session.roomNumber}</td>
                                    <td>{session.presentCount}</td>
                                    <td>{session.absentCount}</td>
                                    <td>
                                        <Link to={`/attendance/session/${session._id}`} className="btn btn-dark">
                                            Attendance History
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="d-flex justify-content-between">
                        <button
                            className="btn btn-secondary"
                            onClick={handlePrevPage}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <button
                            className="btn btn-secondary"
                            onClick={handleNextPage}
                            disabled={!hasMore}
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default CourseSessions;
