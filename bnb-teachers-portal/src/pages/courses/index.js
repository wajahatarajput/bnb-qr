import React, { useState, useEffect } from 'react';
import { server } from '../../helpers'; // Assuming you have a server helper
import { useAuth } from '../../providers'; // Assuming you have an authentication provider

const CourseDetailsPage = () => {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { cookies } = useAuth();

    useEffect(() => {
        // Fetch courses data from the server when the component mounts
        const fetchCourses = async () => {
            try {
                const response = await server.post(`/api/teachers/courses/`, { id: cookies.get('id') });
                setCourses(response.data);
            } catch (error) {
                console.error('Error fetching courses:', error);
            }
        };

        fetchCourses();

        // Clean up function to clear courses state when component unmounts
        return () => {
            setCourses([]);
        };
    }, [cookies]);

    // Filter courses based on search term
    const filteredCourses = courses.filter((course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <div className='d-flex justify-content-between'>
                <h2 className="mb-4">Course Details</h2>
                <div className="mb-3 d-flex justify-content-end">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search Course"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th>Course Name</th>
                        <th>Department</th>
                        <th>Course Code</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCourses.map((course) => (
                        <tr key={course._id}>
                            <td>{course.name}</td>
                            <td>{course.department}</td>
                            <td>{course.course_code}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default CourseDetailsPage;
