import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

function ManageAssignedCourses() {
    const params = useParams();
    const [course, setCourse] = useState(null);
    const [teachers, setTeachers] = useState([]);
    const [teacherId, setTeacherId] = useState('');

    const getCourseData = useCallback(async () => {
        try {
            const response = await server.get(`/api/courses/${params.id}`);
            setCourse(response.data);
        } catch (error) {
            toast.error(`Error fetching course data: ${error.response?.data?.message || error.message}`);
        }
    }, [params.id]);

    const getAllTeachers = useCallback(async () => {
        try {
            const response = await server.get('/api/teachers');
            setTeachers(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const assignCourse = async (e) => {
        e.preventDefault();
        try {
            const response = await server.put(`/api/courses/reassign/${course?._id}/${teacherId}`);
            toast.success(response.data.message);
        } catch (error) {
            toast.error('Error reassigning course');
            console.error(error);
        }
    };

    useEffect(() => {
        getCourseData();
        getAllTeachers();
        return () => {
            setCourse(null);
        };
    }, [getCourseData, getAllTeachers]);

    return (
        <div className="container">
            <h1>Edit Course Assignment</h1>
            <form onSubmit={assignCourse}>
                <div className="mb-3" hidden>
                    <label htmlFor="id" className="form-label">ID</label>
                    <input type="text" className="form-control" id="id" name="id" defaultValue={course?._id} required />
                </div>
                <div className="mb-3">
                    <label htmlFor="teacherId" className="form-label">Teacher:</label>
                    <select className="form-select" id="teacherId" value={teacherId} onChange={(e) => setTeacherId(e.target.value)}>
                        <option value="">Select Teacher</option>
                        {teachers?.map((teacher) => (
                            <option key={teacher?._id} value={teacher?._id}>{teacher?.user?.first_name}- {teacher?.user?.last_name}</option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">Update Course</button>
            </form>
        </div>
    );
}

export default ManageAssignedCourses;
