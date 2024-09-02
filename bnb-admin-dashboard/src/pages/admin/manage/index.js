import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const ManageAdmins = () => {
    const [admins, setAdmins] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    const getAdminsData = useCallback(async () => {
        try {
            const response = await server.get('/api/users', {
                params: {
                    page,
                    limit: pageSize,
                    search
                }
            });
            setAdmins(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('An error occurred while fetching the admins. Please try again later.');
        }
    }, [page, search, pageSize]);

    const handleDelete = useCallback(async (id) => {
        try {
            const res = await server.delete(`/api/users/${id}`);
            if (res.status === 200) {
                setAdmins(admins => admins.filter(admin => admin._id !== id));
                toast.success('Admin deleted successfully!');
            } else {
                toast.error('Failed to delete admin. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting admin:', error);
            toast.error('An error occurred while deleting the admin. Please try again later.');
        }
    }, []);

    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1); // Reset to the first page when search changes
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
    };

    useEffect(() => {
        getAdminsData();
    }, [getAdminsData]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-3">
                <Link to={'/addadmin'} className="btn btn-primary">Add Admin</Link>
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by Username"
                    value={search}
                    onChange={handleSearch}
                />
            </div>
            <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th hidden>ID</th>
                            <th>Username</th>
                            <th>Name</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {admins.map((admin, index) => (
                            <tr key={index}>
                                <td hidden>{admin._id}</td>
                                <td>{admin.username}</td>
                                <td>{admin.first_name} - {admin.last_name}</td>
                                <td>{admin.role}</td>
                                <td className='d-flex gap-2'>
                                    <Link
                                        className="btn btn-secondary"
                                        to={`/editadmin/${admin._id}`}
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(admin._id)}
                                    >
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
                    className="btn btn-secondary"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                >
                    Previous
                </button>
                <button
                    className="btn btn-secondary"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ManageAdmins;
