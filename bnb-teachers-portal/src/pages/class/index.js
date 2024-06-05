import React from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const QRForm = () => {
    const navigate = useNavigate();

    const handleSubmit = (event) => {
        event.preventDefault();
        navigate('/qr-page', {
            state: {
                courseId: event.target[0].value,
                roomNumber: event.target[1].value,
            },
        });
    };

    return (
        <div className="container mt-5">
            <div className="row">
                <div className="col-md-6 offset-md-3">
                    <h2 className="mb-4">Generate QR Code</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="courseId" className="form-label">Course ID</label>
                            <input type="text" className="form-control" id="courseId" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="roomNumber" className="form-label">Room Number</label>
                            <input type="text" className="form-control" id="roomNumber" />
                        </div>
                        <button type="submit" className="btn btn-primary">Generate QR</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default QRForm;
