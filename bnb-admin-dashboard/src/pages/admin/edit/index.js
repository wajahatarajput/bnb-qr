import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditAdminPage = () => {
    const params = useParams();
    const [admin, setAdmin] = useState(null);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        await axios.put(`http://localhost:5000/api/users/${e.target[0].value}`, {
            username: e.target[1].value,
            password: e.target[2].value,
            first_name: e.target[3].value,
            last_name: e.target[4].value,
            role: 'admin'
        }).then((res) => {
            if (res.status === 200) {
                toast.success('Successfully updated student!');
            }
        })
    }, []);

    const getStudentData = useCallback(async () => {
        await axios.get(`http://localhost:5000/api/users/${params.id}`).then((res) => {
            setAdmin(res.data)
        })
    }, [params]);

    useEffect(() => {
        getStudentData();
        return (() => {
            setAdmin([]);
        });
    }, [getStudentData]);

    return (
        <div className="container mt-5">
            <h2>Edit Admin</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3" hidden>
                    <label htmlFor="username" className="form-label">ID</label>
                    <input type="text" className="form-control" defaultValue={admin?._id} id="username" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username</label>
                    <input type="text" className="form-control" defaultValue={admin?.username} id="username" required disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="text" className="form-control" defaultValue={admin?.password} id="password" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" defaultValue={admin?.first_name} id="firstName" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" defaultValue={admin?.last_name} id="lastName" required />
                </div>
                <button type="submit" className="btn btn-primary w-100">Update Admin </button>
            </form>
        </div>
    );
};

export default EditAdminPage;
