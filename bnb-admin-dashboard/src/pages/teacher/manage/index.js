import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const ManageTeachers = () => {
    const [teachers, setTeachers] = useState([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize] = useState(10);

    const getTeachersData = useCallback(async () => {
        try {
            const response = await server.get('/api/teachers', {
                params: {
                    page,
                    limit: pageSize,
                    search
                }
            });
            setTeachers(response.data.teachers);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast.error('An error occurred while fetching the teachers. Please try again later.');
        }
    }, [page, search, pageSize]);

    const handleDelete = useCallback(async (id) => {
        try {
            const res = await server.delete(`/api/teachers/${id}`);
            if (res.status === 200) {
                setTeachers(teachers => teachers.filter(teacher => teacher._id !== id));
                toast.success('Teacher deleted successfully!');
            } else {
                toast.error('Failed to delete teacher. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting teacher:', error);
            toast.error('An error occurred while deleting the teacher. Please try again later.');
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
        getTeachersData();
    }, [getTeachersData]);

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-end mb-3">
                <Link to={'/addteacher'} className="btn btn-primary">Add Teacher</Link>
            </div>
            <div className="mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by CMS ID"
                    value={search}
                    onChange={handleSearch}
                />
            </div>
            <div className="table-responsive" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <table className="table table-striped">
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
            <div className="d-flex justify-content-between mt-3">
                <button
                    className="btn btn-outline-primary"
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                >
                    Previous
                </button>
                <span>Page {page} of {totalPages}</span>
                <button
                    className="btn btn-outline-primary"
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ManageTeachers;
