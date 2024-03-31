import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);

    const getStudentsData = useCallback(async () => {
        await axios.get('http://localhost:5000/api/students').then((res) => {
            setStudents(res.data)
        })
    }, []);

    const handleDelete = useCallback(async (id) => {
        await axios.delete(`http://localhost:5000/api/students/${id}`).then((res) => {
            setStudents(students => students.filter(student => student._id !== id));
        })
    }, []);

    useEffect(() => {
        getStudentsData();
        return (() => {
            setStudents([]);
        });
    }, [getStudentsData]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-3">
                <Link to={'/addstudent'} className="btn btn-primary">Add Student</Link>
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
                    {students.map((student, index) => (
                        <tr key={index}>
                            <td hidden>{student._id}</td>
                            <td>{student.user.username}</td>
                            <td>{student.user.first_name}</td>
                            <td>{student.user.last_name}</td>
                            <td>{new Date(student.joiningDate).toLocaleDateString()}</td>
                            <td>{student.leavingDate ? new Date(student.leavingDate).toLocaleDateString() : 'N/A'}</td>
                            <td>{student.status}</td>
                            <td className='d-flex gap-2'>
                                <Link
                                    className="btn btn-secondary"
                                    to={`/editstudent/${student._id}`}
                                >
                                    Edit
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(student._id)}
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

export default ManageStudents;
