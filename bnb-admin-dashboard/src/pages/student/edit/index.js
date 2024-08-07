
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { server } from '../../../helpers';

const EditStudentPage = () => {
    const params = useParams();
    const [student, setStudent] = useState(null);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        try {
            const res = await server.put(`/api/students/${e.target[0].value}`, {
                username: e.target[1].value,
                password: e.target[2].value,
                first_name: e.target[3].value,
                last_name: e.target[4].value,
                leavingDate: e.target[5].value,
                status: e.target[6].value
            });

            if (res.status === 200) {
                toast.success('Successfully updated student!');
            } else {
                toast.error('Failed to update student. Please try again.');
            }
        } catch (error) {
            console.error('Error updating student:', error);
            toast.error('An error occurred while updating the student. Please try again later.');
        }
    }, []);

    const getStudentData = useCallback(async () => {
        try {
            const res = await server.get(`/api/students/${params.id}`);
            setStudent(res.data);
        } catch (error) {
            console.error('Error fetching student data:', error);
            toast.error('An error occurred while fetching the student data. Please try again later.');
        }
    }, [params.id]);

    useEffect(() => {
        getStudentData();
        return () => {
            setStudent(null);
        };
    }, [getStudentData]);

    return (
        <div className="container mt-5">
            <h2>Edit Student</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3" hidden>
                    <label htmlFor="studentId" className="form-label">ID</label>
                    <input type="text" className="form-control" defaultValue={student?._id} id="studentId" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username (CMS ID)</label>
                    <input type="text" className="form-control" defaultValue={student?.user?.username} id="username" required disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="text" className="form-control" defaultValue={student?.user?.password} id="password" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" defaultValue={student?.user?.first_name} id="firstName" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" defaultValue={student?.user?.last_name} id="lastName" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="leavingDate" className="form-label">Leaving Date</label>
                    <input type="date" className="form-control" defaultValue={student?.leavingDate} id="leavingDate" />
                </div>
                <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select className="form-select" defaultValue={student?.status} id="status">
                        <option value="active">Active</option>
                        <option value="left">Left</option>
                        <option value="pass_out">Pass Out</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">Update Student</button>
            </form>
        </div>
    );
};

export default EditStudentPage;
