import React, { useCallback } from 'react';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const AddAdminPage = () => {

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await server.post('/api/users', {
                username: e.target[0].value,
                password: e.target[1].value,
                first_name: e.target[2].value,
                last_name: e.target[3].value,
                role: 'admin'
            });

            if (response.status === 201) {
                toast.success("Added Admin successfully!");
            } else {
                toast.error("Failed to add admin. Please try again.");
            }
        } catch (error) {
            toast.error(`Error: ${error.response?.data?.message || error.message}`);
        }
    }, []);

    return (
        <div className="container mt-5">
            <h2>Add Admin</h2>
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
                <button type="submit" className="btn btn-primary w-100">Add Admin</button>
            </form>
        </div>
    );
};

export default AddAdminPage;
