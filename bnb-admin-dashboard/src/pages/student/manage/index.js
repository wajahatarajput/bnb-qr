import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);

    const getStudentsData = useCallback(async () => {
        try {
            const response = await server.get('/api/students');
            setStudents(response.data);
        } catch (error) {
            toast.error(`Error fetching students: ${error.response?.data?.message || error.message}`);
        }
    }, []);

    const handleDelete = useCallback(async (id) => {
        try {
            const response = await server.delete(`/api/students/${id}`);
            if (response.status === 200) {
                setStudents(students => students.filter(student => student._id !== id));
                toast.success('Successfully deleted student!');
            } else {
                toast.error('Failed to delete student. Please try again.');
            }
        } catch (error) {
            toast.error(`Error deleting student: ${error.response?.data?.message || error.message}`);
        }
    }, []);

    useEffect(() => {
        getStudentsData();
        return () => {
            setStudents([]);
        };
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
                    {students.length > 0 && students.map((student, index) => (
                        <tr key={index}>
                            <td hidden>{student?._id}</td>
                            <td>{student?.user?.username}</td>
                            <td>{student?.user?.first_name}</td>
                            <td>{student?.user?.last_name}</td>
                            <td>{new Date(student?.joiningDate).toLocaleDateString()}</td>
                            <td>{student?.leavingDate ? new Date(student?.leavingDate).toLocaleDateString() : 'N/A'}</td>
                            <td>{student?.status}</td>
                            <td className='d-flex gap-2'>
                                <Link
                                    className="btn btn-secondary"
                                    to={`/editstudent/${student?._id}`}
                                >
                                    Edit
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(student?._id)}
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
