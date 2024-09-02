import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const ManageCourses = () => {
    const [courses, setCourses] = useState([]);

    const getCoursesData = useCallback(async () => {
        try {
            const response = await server.get('/api/courses');
            setCourses(response.data);
        } catch (error) {
            toast.error(`Error fetching courses: ${error.response?.data?.message || error.message}`);
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            const response = await server.delete(`/api/courses/${id}`);
            if (response.status === 200) {
                setCourses(courses => courses.filter(course => course._id !== id));
                toast.success('Successfully deleted course!');
            } else {
                toast.error('Failed to delete course. Please try again.');
            }
        } catch (error) {
            toast.error(`Error deleting course: ${error.response?.data?.message || error.message}`);
        }
    }, []);

    useEffect(() => {
        getCoursesData();
        return () => {
            setCourses([]);
        };
    }, [getCoursesData]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-3 gap-2">
                <Link to={'/createcourse'} className="btn btn-primary">Add Course</Link>
                <Link to={'/assigncourse'} className="btn btn-secondary">Assign Course</Link>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th hidden>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Course Code</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {courses.map((course, index) => (
                        <tr key={index}>
                            <td hidden>{course._id}</td>
                            <td>{course.name}</td>
                            <td>{course.department}</td>
                            <td>{course.course_code}</td>
                            <td className='d-flex gap-2'>

                                <Link to={`/manageassignment/${course._id}`} className="btn btn-secondary">Manage Assigned Course</Link>
                                <Link
                                    className="btn btn-secondary"
                                    to={`/editcourse/${course._id}`}
                                >
                                    Edit
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(course._id)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ManageCourses;
