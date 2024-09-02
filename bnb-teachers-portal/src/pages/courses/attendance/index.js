import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { server } from '../../../helpers';
import { toast } from 'react-toastify';

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

    const toggleAttendance = async (studentId, currentStatus) => {
        const newStatus = !currentStatus; // Toggle the current state

        console.log(studentId)

        try {
            // Optionally define a fingerprint or unique identifier
            const fingerprint = studentId; // Use studentId as the fingerprint, or adjust as needed

            // Send the request to the API with all required parameters
            const response = await server.put(`/api/attendance/modify/${sessionId}/${studentId}`, {
                isPresent: newStatus,
                fingerprint
            });

            const { isPresent, student } = response?.data;

            // Update local state to reflect the change
            setAttendanceRecords(prevRecords =>
                prevRecords.map(record =>
                    record.student?.user?._id === student
                        ? { ...record, isPresent }
                        : record
                )
            );

            if (isPresent) {
                toast.info('Successfully Marked Present!');
            } else {
                toast.info('Successfully Marked Absent!');
            }
        } catch (error) {
            console.error('Error toggling attendance:', error);
        }
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
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
                                <th scope="col">Student Name</th>
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
                                                onChange={() => toggleAttendance(record?.student?.user?._id, record?.isPresent)}
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
