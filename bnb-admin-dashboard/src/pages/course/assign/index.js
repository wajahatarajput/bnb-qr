import React, { useCallback, useEffect, useState } from 'react';
import { server } from '../../../helpers';
import { toast } from 'react-toastify';


const AssignCourse = () => {
    const [teachers, setTeachers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [teacherId, setTeacherId] = useState('');
    const [courseId, setCourseId] = useState('');
    // const [message, setMessage] = useState('');

    const getAllTeachers = useCallback(async () => {
        try {
            const response = await server.get('/api/listteachers');
            setTeachers(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const getAllCourses = useCallback(async () => {
        try {
            const response = await server.get('/api/listcourses');
            setCourses(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    useEffect(() => {
        getAllTeachers();
        getAllCourses();
    }, [getAllCourses, getAllTeachers]);

    const assignCourse = async () => {
        try {
            const response = await server.post(`/assigncourse/${teacherId}/${courseId}`);
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Error assigning course');
            console.error(error);
        }
    };

    return (
        <div className="container mt-5">
            <h2>Assign Course to Teacher</h2>
            <div className="mb-3">
                <label htmlFor="teacherId" className="form-label">Teacher:</label>
                <select className="form-select" id="teacherId" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                    <option value="">Select Teacher</option>
                    {teachers?.map((teacher) => (
                        <option key={teacher?._id} value={teacher?._id}>{teacher?.user?.first_name}- {teacher?.user?.last_name}</option>
                    ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="courseId" className="form-label">Course:</label>
                <select className="form-select" id="courseId" value={courseId} onChange={(e) => setCourseId(e.target.value)}>
                    <option value="">Select Course</option>
                    {courses?.map((course) => (
                        <option key={course?._id} value={course?._id}>{course?.name} - {course?.course_code}</option>
                    ))}
                </select>
            </div>
            <button className="btn btn-primary" onClick={assignCourse}>Assign Course</button>
            {/* {message && <div className="mt-3">{message}</div>} */}
        </div>
    );
};

export default AssignCourse;
