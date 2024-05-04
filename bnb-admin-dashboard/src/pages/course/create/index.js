import React from 'react';
import { server } from '../../../helpers';


function CreateCourse() {
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await server.post('/api/courses', {
                name: e.target[0].value,
                department: e.target[1].value,
                course_code: e.target[2].value,
            });
            console.log(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container">
            <h1>Create Course</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">Name</label>
                    <input type="text" className="form-control" id="name" name="name" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="department" className="form-label">Department</label>
                    <input type="text" className="form-control" id="department" name="department" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="courseCode" className="form-label">Course Code</label>
                    <input type="text" className="form-control" id="courseCode" name="courseCode" required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Create Course</button>
            </form>
        </div>
    );
}

export default CreateCourse;
