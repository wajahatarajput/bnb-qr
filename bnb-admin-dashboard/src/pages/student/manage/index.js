import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const ManageStudents = () => {
    const [students, setStudents] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    // const [pageSize, setPageSize] = useState(10);
    const [searchTerm, setSearchTerm] = useState('');

    const getStudentsData = useCallback(async (page = 1, search = '') => {
        try {
            const response = await server.get(`/api/students?page=${page}&limit=${10}&search=${search}`);
            setStudents(response.data.students);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            toast.error(`Error fetching students: ${error.response?.data?.message || error.message}`);
        }
    }, []);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
        setCurrentPage(1); // Reset to the first page when searching
    };

    const handleDelete = useCallback(async (id) => {
        try {
            const response = await server.delete(`/api/students/${id}`);
            if (response.status === 200) {
                setStudents(students => students.filter(student => student._id !== id));
                toast.success('Successfully deleted student!');
                getStudentsData(currentPage, searchTerm);
            } else {
                toast.error('Failed to delete student. Please try again.');
            }
        } catch (error) {
            toast.error(`Error deleting student: ${error.response?.data?.message || error.message}`);
        }
    }, [currentPage, searchTerm, getStudentsData]);

    useEffect(() => {
        getStudentsData(currentPage, searchTerm);
    }, [getStudentsData, currentPage, searchTerm]);

    const handlePageChange = (page) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between mb-3 gap-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Search by username..."
                    value={searchTerm}
                    onChange={handleSearch}
                />

                <Link to={'/addstudent'} className="btn btn-primary ml-2">Add Student</Link>
            </div>
            <div className="table-responsive">
                <table className="table table-bordered table-hover">
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
                        {students.length > 0 ? (
                            students.map((student, index) => (
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
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" className="text-center">No students found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="d-flex justify-content-between mt-3">
                <button
                    className="btn btn-outline-primary"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button
                    className="btn btn-outline-primary"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default ManageStudents;
