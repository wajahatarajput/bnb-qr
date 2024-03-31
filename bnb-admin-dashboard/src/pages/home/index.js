import { faBook, faUserGraduate, faUsers } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="container-fluid d-flex align-items-center justify-content-center ">
            <div className="row">
                <div className="col-md-4">
                    <Link to="/managestudent" className="text-decoration-none text-dark">
                        <div className="card text-center p-4 shadow" style={{ minHeight: '130px' }}>
                            <FontAwesomeIcon icon={faUsers} />
                            <h4>Manage Students</h4>
                        </div>
                    </Link>
                </div>
                <div className="col-md-4">
                    <Link to="/manageteachers" className="text-decoration-none text-dark">
                        <div className="card text-center p-4 shadow" style={{ minHeight: '130px' }}>
                            <FontAwesomeIcon icon={faUserGraduate} />
                            <h4>Manage Teachers</h4>
                        </div>
                    </Link>
                </div>
                <div className="col-md-4">
                    <Link to="/managecourse" className="text-decoration-none text-dark">
                        <div className="card text-center p-4 shadow" style={{ minHeight: '130px' }}>
                            <FontAwesomeIcon icon={faBook} />
                            <h4>Manage Courses</h4>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
