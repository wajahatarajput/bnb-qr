import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10); // Courses per page

    const getCoursesData = useCallback(async (page = 1) => {
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
    }, [pageSize, search]);

    const handleDelete = useCallback(async (id) => {
        try {
            const response = await server.delete(`/api/courses/${id}`);
            if (response.status === 200) {
                setCourses(courses => courses.filter(course => course._id !== id));
                toast.success('Successfully deleted course!');
                // Fetch data again for the current page after deletion
                getCoursesData(currentPage);
            } else {
                toast.error('Failed to delete course. Please try again.');
            }
        } catch (error) {
            toast.error(`Error deleting course: ${error.response?.data?.message || error.message}`);
        }
    }, [currentPage, getCoursesData]);

    useEffect(() => {
        getCoursesData(currentPage);
    }, [getCoursesData, currentPage]);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setCurrentPage(1); // Reset to the first page when search changes
    };

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-3 gap-2">
                <Link to={'/createcourse'} className="btn btn-primary">Add Course</Link>
                <Link to={'/assigncourse'} className="btn btn-secondary">Assign Course</Link>
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Course Name"
                    value={search}
                    onChange={handleSearch}
                />
            </div>
            <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th hidden>ID</th>
                            <th>Name</th>
                            <th>Department</th>
                            <th>Teacher</th>
                            <th>Total Students</th>
                            <th>Total Sessions</th>
                            <th>Attendance Average</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course, index) => (
                            <tr key={index}>
                                <td hidden>{course._id}</td>
                                <td>{course.name}</td>
                                <td>{course.department}</td>
                                <td>{course?.sessions[0]?.teacher?.user?.first_name}</td>
                                <td>{course.totalStudents}</td>
                                <td>{course.totalSessions}</td>
                                <td>{course.attendanceAverage.toFixed(2)}%</td>
                                <td className='d-flex gap-2'>
                                    <Link to={`/manageassignment/${course._id}`} className="btn btn-secondary">Manage Assigned Course</Link>
                                    <Link className="btn btn-secondary" to={`/editcourse/${course._id}`}>
                                        Edit
                                    </Link>
                                    <button className="btn btn-danger" onClick={() => handleDelete(course._id)}>
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
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

export default ManageCourses;
