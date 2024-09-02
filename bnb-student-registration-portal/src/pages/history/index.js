import React, { useEffect, useState } from 'react';
import { parseISO, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import 'bootstrap/dist/css/bootstrap.min.css';
import { server } from '../../helpers';
import { useAuth } from '../../providers';

const AttendanceHistory = () => {
    const [attendance, setAttendance] = useState([]);
    const [filteredAttendance, setFilteredAttendance] = useState([]);
    const [error, setError] = useState('');
    const [courses, setCourses] = useState([]);
    const { cookies } = useAuth();
    const [timeFilter, setTimeFilter] = useState('all');
    const [courseFilter, setCourseFilter] = useState('all');

    useEffect(() => {
        const fetchAttendance = async () => {
            // try {
            const response = await server.get(`/api/attendance-history/${cookies.get('id')}`);
            const data = response.data;
            setAttendance(data || []);
            setFilteredAttendance(data || []); // Initially show all data
            setError('');
            // Extract unique courses
            const uniqueCourses = [
                ...new Map(
                    data.map(session => [session.course._id, session.course])
                ).values()
            ];
            setCourses(uniqueCourses);

            // } catch (err) {
            //     setError('Failed to fetch attendance history.');
            // }
        };

        fetchAttendance();
    }, [cookies]);

    useEffect(() => {
        const now = new Date();
        const filterAttendance = () => {
            let filtered = attendance;

            if (timeFilter !== 'all') {
                filtered = filtered.filter(session => {
                    const sessionDate = parseISO(session.sessionTime);
                    switch (timeFilter) {
                        case 'week':
                            return isSameWeek(sessionDate, now);
                        case 'month':
                            return isSameMonth(sessionDate, now);
                        case 'year':
                            return isSameYear(sessionDate, now);
                        default:
                            return true;
                    }
                });
            }

            if (courseFilter !== 'all') {
                filtered = filtered.filter(session => session.course._id === courseFilter);
            }

            return filtered;
        };

        setFilteredAttendance(filterAttendance);
    }, [timeFilter, courseFilter, attendance]);

    return (
        <div className="container mt-5">
            {error !== '' && <div className="alert alert-danger">{error}</div>}
            <div className='d-flex justify-content-between'>
                <h1>Attendance History</h1>
                <div className='d-flex'>
                    <div className="mb-3 me-3">
                        <label htmlFor="timeFilter" className="form-label">Filter by Time:</label>
                        <select
                            id="timeFilter"
                            className="form-select"
                            value={timeFilter}
                            onChange={(e) => setTimeFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            <option value="week">This Week</option>
                            <option value="month">This Month</option>
                            <option value="year">This Year</option>
                        </select>
                    </div>
                    <div className="mb-3">
                        <label htmlFor="courseFilter" className="form-label">Filter by Course:</label>
                        <select
                            id="courseFilter"
                            className="form-select"
                            value={courseFilter}
                            onChange={(e) => setCourseFilter(e.target.value)}
                        >
                            <option value="all">All</option>
                            {courses.map(course => (
                                <option key={course._id} value={course._id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
            <table className="table table-striped table-bordered table-hover mt-3">
                <thead className="table-dark">
                    <tr>
                        <th scope="col">Course</th>
                        <th scope="col">Date</th>
                        <th scope="col">Room Number</th>
                        <th scope="col">Attendance</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredAttendance.map((session) => (
                        <tr key={session._id}>
                            <td>{session.course.name}</td>
                            <td>{new Date(session.sessionTime).toLocaleString()}</td>
                            <td>{session.roomNumber}</td>
                            <td>
                                {session.attendances.map((att, index) => (
                                    <span key={index}>
                                        {att.isPresent ? 'Present' : 'Absent'}
                                    </span>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AttendanceHistory;
