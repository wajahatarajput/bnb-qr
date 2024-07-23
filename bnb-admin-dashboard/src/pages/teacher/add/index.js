import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const AddTeacherPage = () => {

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            const res = await server.post('/api/teachers', {
                username: e.target[0].value,
                password: e.target[1].value,
                first_name: e.target[2].value,
                last_name: e.target[3].value,
                role: 'teacher'
            });

            if (res.status === 201) {
                toast.success("Added teacher successfully!");
            } else {
                toast.error("Failed to add teacher. Please try again.");
            }
        } catch (error) {
            console.error("Error adding teacher:", error);
            toast.error("An error occurred while adding the teacher. Please try again later.");
        }
    }, []);

    return (
        <div className="container mt-5">
            <h2>Add Teacher</h2>
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
                <button type="submit" className="btn btn-primary w-100">Add Teacher</button>
            </form>
        </div>
    );
};

export default AddTeacherPage;
