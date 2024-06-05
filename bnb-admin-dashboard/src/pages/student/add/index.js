
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const AddStudentPage = () => {

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        await server.post('/api/students', {
            username: e.target[0].value,
            password: e.target[1].value,
            first_name: e.target[2].value,
            last_name: e.target[3].value,
            role: 'student'
        }).then((res) => {
            if (res.status === 201) {
                toast.success("Added student successfully!");
            }
        })
    }, []);

    return (
        <div className="container mt-5">
            <h2>Add Student</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username (CMS ID)</label>
                    <input type="text" className="form-control" id="username" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="text" className="form-control" id="password" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" id="firstName" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" id="lastName" required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Add Student</button>
            </form>
        </div>
    );
};

export default AddStudentPage;
