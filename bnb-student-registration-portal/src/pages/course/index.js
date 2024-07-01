import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../providers/AuthProvider';
import { SERVER_URL } from '../../config';
import CourseCard from '../../components/course';

const CoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const {cookies} = useAuth();
    useEffect(() => {
        const fetchCourses = async () => {
            const studentId = cookies.get('id'); // Replace with actual logged-in student ID
            const response = await axios.get(`${SERVER_URL}/studentcourses?studentId=${studentId}`);
            setCourses(response.data);
        };
        fetchCourses();
    }, []);

    const handleUnenroll = async (courseId) => {
        const studentId = cookies.get('id'); // Replace with actual logged-in student ID
        await axios.delete(`${SERVER_URL}/studentcourses?studentId=${studentId}&courseId=${courseId}`);
        setCourses(courses.filter(course => course._id !== courseId));
    };

    return (
        <div className="container mt-5">
            <div className="row">
                {courses.map(course => (
                    <CourseCard key={course._id} course={course} onUnenroll={handleUnenroll} />
                ))}
            </div>
        </div>
    );
};

export default CoursesPage;