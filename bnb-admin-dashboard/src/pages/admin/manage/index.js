import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);

    const getStudentsData = useCallback(async () => {
        await axios.get('http://localhost:5000/api/users').then((res) => {
            setAdmins(res.data)
        })
    }, []);

    const handleDelete = useCallback(async (id) => {
        await axios.delete(`http://localhost:5000/api/users/${id}`).then((res) => {
            setAdmins(admins => admins.filter(admin => admin?._id !== id));
        })
    }, []);

    useEffect(() => {
        getStudentsData();
        return (() => {
            setAdmins([]);
        });
    }, [getStudentsData]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-3">
                <Link to={'/addadmin'} className="btn btn-primary">Add Admin</Link>
            </div>
            <table className="table">
                <thead>
                    <tr>
                        <th hidden>ID</th>
                        <th>Username</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.map((admin, index) => (
                        <tr key={index}>
                            <td hidden>{admin?._id}</td>
                            <td>{admin?.username}</td>
                            <td>{admin?.first_name}</td>
                            <td>{admin?.last_name}</td>
                            <td className='d-flex gap-2'>
                                <Link
                                    className="btn btn-secondary"
                                    to={`/editadmin/${admin?._id}`}
                                >
                                    Edit
                                </Link>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(admin?._id)}
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

export default ManageAdmins;
