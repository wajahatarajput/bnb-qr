import React, { useCallback, useState } from 'react';

import { toast } from 'react-toastify';
import { useAuth } from '../../providers';
import { server } from '../../helpers';

const RegisterCourse = () => {
    const [course_code, setCourseCode] = useState('');
    const { cookies } = useAuth();

    const handleRegister = useCallback(async (e) => {
        e.preventDefault();
        try {
            const response = await server.post(`/registercourse/${cookies.get('id')}/${course_code}`);
            toast.success(response.data.message);
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.message);
            } else {
                toast.error('Failed to register in the course');
            }
        }
    }, [course_code, cookies]);

    return (
        <div className="container mt-5">
            <h2>Register in a Course</h2>
            <form onSubmit={handleRegister}>
                <div className="mb-3">
                    <label htmlFor="courseCode" className="form-label">Course Code:</label>
                    <input
                        type="text"
                        className="form-control"
                        id="courseCode"
                        value={course_code}
                        onChange={(e) => setCourseCode(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary w-100">Register</button>
            </form>
        </div>
    );
};

export default RegisterCourse;
