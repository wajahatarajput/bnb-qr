import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Doughnut } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { server } from '../../helpers';
import { toast } from 'react-toastify';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend);

const CourseList = () => {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10); // Courses per page

    const fetchCourses = useCallback(async (page = 1) => {
        try {
            const response = await server.get('/api/courses', {
                params: {
                    page,
                    limit: pageSize,
                    search
                }
            });
            setCourses(response.data.courses);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            toast.error(`Error fetching courses: ${error.response?.data?.message || error.message}`);
        }
    }, [search, pageSize]);

    useEffect(() => {
        fetchCourses(currentPage);
    }, [fetchCourses, currentPage]);

    const getChartData = (course) => {
        return {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [course?.attendanceAverage || 0, 100 - (course?.attendanceAverage || 0)],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384']
            }]
        };
    };

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset to first page on search
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="container mt-5">
            <h1 className="mb-4">Admin Panel - Courses</h1>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Course Name"
                    value={search}
                    onChange={handleSearch}
                />
            </div>
            {courses.length === 0 ? (
                <p>No courses available.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-striped text-center">
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
                            {courses.map(course => (
                                <tr key={course._id}>
                                    <td>{course.name}</td>
                                    <td>{course.department}</td>
                                    <td>{course.students.length || 0}</td>
                                    <td>{course.sessions.length || 0}</td>
                                    <td>{course?.attendanceAverage?.toFixed(2) || 0}</td>
                                    <td>
                                        <div style={{ width: '150px', height: '150px' }}>
                                            <Doughnut data={getChartData(course)} />
                                        </div>
                                    </td>
                                    <td>
                                        <Link to={`/course-history/${course._id}`} className="btn btn-dark rounded-pill">History</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <div className="d-flex justify-content-between mt-3">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    className="btn btn-outline-primary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default CourseList;
