import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers';
import { toast } from 'react-toastify';
import { server } from '../../helpers';


const QRForm = () => {
    const navigate = useNavigate();
    const { cookies } = useAuth();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            // Get userId from cookies
            const userId = cookies.get('id');

            if (!userId) {
                toast.error('User ID not found in cookies.');
                return;
            }

            const response = await server.get(`/api/checkcourseassignment/${userId}/${event.target.courseId.value}`);


            if (response?.data?.message === 'Course is assigned to the teacher.') {
                toast.success('Course is assigned to the teacher.');
                // Retrieve form values
                const courseId = event.target.courseId.value;
                const roomNumber = event.target.roomNumber.value;

                // Navigate to the QR page with state
                navigate('/qr-page', {
                    state: {
                        userId,
                        courseId,
                        roomNumber,
                    },
                });
            }



        } catch (err) {
            toast.error(err.response.data.message)
        }
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h2 className="mb-4">Generate QR Code</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="courseId" className="form-label">Course ID</label>
                            <input type="text" className="form-control" id="courseId" name="courseId" required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="roomNumber" className="form-label">Room Number</label>
                            <input type="text" className="form-control" id="roomNumber" name="roomNumber" required />
                        </div>
                        <button type="submit" className="btn btn-primary">Generate QR</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QRForm;
