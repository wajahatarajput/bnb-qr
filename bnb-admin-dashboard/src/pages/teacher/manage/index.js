
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { server } from '../../../helpers';

const ManageTeachers = () => {
    const [teachers, setTeachers] = useState([]);

    const getTeacherssData = useCallback(async () => {
        await server.get('/api/teachers').then((res) => {
            setTeachers(res.data)
        })
    }, []);

    const handleDelete = useCallback(async (id) => {
        await server.delete(`/api/teachers/${id}`).then((res) => {
            setTeachers(teachers => teachers.filter(teacher => teacher._id !== id));
        })
    }, []);

    useEffect(() => {
        getTeacherssData();
        return (() => {
            setTeachers([]);
        });
    }, [getTeacherssData]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-3">
                <Link to={'/addteacher'} className="btn btn-primary">Add Teacher</Link>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th hidden>ID</th>
                        <th>CMS ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Joining Date</th>
                        <th>Leaving Date</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {teachers.map((teacher, index) => (
                        <tr key={index}>
                            <td hidden>{teacher._id}</td>
                            <td>{teacher.user.username}</td>
                            <td>{teacher.user.first_name}</td>
                            <td>{teacher.user.last_name}</td>
                            <td>{new Date(teacher.joiningDate).toLocaleDateString()}</td>
                            <td>{teacher.leavingDate ? new Date(teacher.leavingDate).toLocaleDateString() : 'N/A'}</td>
                            <td>{teacher.status}</td>
                            <td className='d-flex gap-2'>
                                <Link
                                    className="btn btn-secondary"
                                    to={`/editteacher/${teacher._id}`}
                                >
                                    Edit
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(teacher._id)}
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

export default ManageTeachers;
