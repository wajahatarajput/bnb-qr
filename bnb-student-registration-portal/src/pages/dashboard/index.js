import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faQrcode, faUsers } from '@fortawesome/free-solid-svg-icons';
import React from 'react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
    return (
        <div className="container-fluid d-flex align-items-center justify-content-center ">
            <div className="row">
                <div className="col-md-6">
                    <Link to="/scanner" className="text-decoration-none text-dark">
                        <div className="card text-center p-4 shadow" style={{ minHeight: '130px' }}>
                            <FontAwesomeIcon icon={faQrcode} />
                            <h4>Scan QR code</h4>
                        </div>
                    </Link>
                </div>
                <div className="col-md-6">
                    <Link to="/register" className="text-decoration-none text-dark">
                        <div className="card text-center p-4 shadow" style={{ minHeight: '130px' }}>
                            <FontAwesomeIcon icon={faUsers} />
                            <h4>Register Course</h4>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
