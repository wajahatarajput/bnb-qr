import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { server } from '../../../helpers';

const AttendanceRecords = () => {
    const { sessionId } = useParams();
    const [attendanceRecords, setAttendanceRecords] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [hasMore, setHasMore] = useState(false);

    useEffect(() => {
        const fetchAttendanceRecords = async () => {
            setLoading(true);
            try {
                const response = await server.get(`/api/attendance/session/${sessionId}`, {
                    params: { page, limit: 10 }
                });
                setAttendanceRecords(response.data.attendanceRecords);
                setHasMore(response.data.hasMore);
            } catch (error) {
                console.error('Error fetching attendance records:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceRecords();
    }, [sessionId, page]);

    const handlePrevPage = () => {
        setPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleNextPage = () => {
        if (hasMore) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const toggleAttendance = async (studentId) => {
        setAttendanceRecords(prevRecords =>
            prevRecords.map(record =>
                record.student?._id === studentId
                    ? { ...record, isPresent: !record.isPresent }
                    : record
            )
        );

        try {
            await server.put(`/api/attendance/modify/${sessionId}/${studentId}`);
        } catch (error) {
            console.error('Error toggling attendance:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        console.log(date)
        return isNaN(date.getTime()) ? new Date().toLocaleString() : date.toLocaleString();
    };

    return (
        <div className="container mt-5">
            <h2 className="mb-4">Attendance Records</h2>
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th scope="col">Student ID</th>
                                <th scope="col">Present</th>
                                <th scope="col">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceRecords.map((record, index) => (
                                <tr key={index}>
                                    <td>{record?.student?.user?.first_name}</td>
                                    <td>
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                checked={record.isPresent}
                                                onChange={() => toggleAttendance(record.student?._id)}
                                            />
                                        </div>
                                    </td>
                                    <td>{formatTimestamp(record.timestamp)}</td>
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

export default AttendanceRecords;
