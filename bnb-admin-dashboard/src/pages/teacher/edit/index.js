import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditTeacherPage = () => {
    const params = useParams();
    const [teacher, setTeacher] = useState(null);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        await axios.put(`http://localhost:5000/api/teachers/${e.target[0].value}`, {
            username: e.target[1].value,
            password: e.target[2].value,
            first_name: e.target[3].value,
            last_name: e.target[4].value,
            leavingDate: e.target[5].value, // Added leavingDate field
            status: e.target[6].value // Added status field
        }).then((res) => {
            if (res.status === 200) {
                toast.success('Successfully updated teacher!');
            }
        })
    }, []);

    const getteacherData = useCallback(async () => {
        await axios.get(`http://localhost:5000/api/teachers/${params.id}`).then((res) => {
            setTeacher(res.data)
        })
    }, [params]);

    useEffect(() => {
        getteacherData();
        return (() => {
            setTeacher([]);
        });
    }, [getteacherData]);

    return (
        <div className="container mt-5">
            <h2>Edit Teacher</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3" hidden>
                    <label htmlFor="username" className="form-label">ID</label>
                    <input type="text" className="form-control" defaultValue={teacher?._id} id="username" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="username" className="form-label">Username (CMS ID)</label>
                    <input type="text" className="form-control" defaultValue={teacher?.user?.username} id="username" required disabled />
                </div>
                <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input type="text" className="form-control" defaultValue={teacher?.user?.password} id="password" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input type="text" className="form-control" defaultValue={teacher?.user?.first_name} id="firstName" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input type="text" className="form-control" defaultValue={teacher?.user?.last_name} id="lastName" required />
                </div>
                <div className="mb-3">
                    <label htmlFor="leavingDate" className="form-label">Leaving Date</label>
                    <input type="date" className="form-control" defaultValue={teacher?.leavingDate} id="leavingDate" />
                </div>
                <div className="mb-3">
                    <label htmlFor="status" className="form-label">Status</label>
                    <select className="form-select" defaultValue={teacher?.status} id="status">
                        <option value="active">Active</option>
                        <option value="left">Left</option>
                        <option value="pass_out">Pass Out</option>
                    </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">Update Teacher</button>
            </form>
        </div>
    );
};

export default EditTeacherPage;
