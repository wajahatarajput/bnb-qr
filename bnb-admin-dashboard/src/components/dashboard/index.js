import React from 'react';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUsers, faUserGraduate, faBook, faUserCircle, faUserCog, faUserClock } from '@fortawesome/free-solid-svg-icons';
import './style.css'
import { useAuth } from '../../providers';
import { Link } from 'react-router-dom';

function Dashboard(props) {
    const { children } = props;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const { logout, cookies } = useAuth();

    const handleAvatarClick = () => {
        setIsDropdownOpen(!isDropdownOpen);
    };

    const handleLogout = () => {
        // Your logout logic here
        logout()
    };

    return (
        <div className="container-fluid vh-100 d-flex flex-column p-0">

            {/* Sidebar and Main Panel */}
            <div className="d-flex flex-grow-1">
                {/* Sidebar */}
                <div
                    className="bg-purple text-light d-flex flex-column px-3 justify-content-center align-items-center"
                    style={{ width: '5%' }}
                >
                    <ul className="nav flex-column">
                        <li className="nav-item">
                            <Link to={'/dashboard'} className="nav-link">
                                <FontAwesomeIcon icon={faHome} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/managecourse'} className="nav-link">
                                <FontAwesomeIcon icon={faBook} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/manageteachers'} className="nav-link active">
                                <FontAwesomeIcon icon={faUserGraduate} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/managestudent'} className="nav-link">
                                <FontAwesomeIcon icon={faUsers} />
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to={'/manageadmins'} className="nav-link">
                                <FontAwesomeIcon icon={faUserCog} />
                            </Link>
                        </li>
                        
                        <li className="nav-item">
                            <Link to={'/courselist'} className="nav-link">
                                <FontAwesomeIcon icon={faUserClock} />
                            </Link>
                        </li>
                    </ul>
                </div>

                {/* Main Panel */}
                <div className="flex-grow-1 justify-content-center align-items-center">
                    {/* Topbar */}
                    <div className="bg-purple" style={{ height: '7%' }}>
                        <div className="container-fluid d-flex justify-content-end align-items-center py-2">
                            <div>
                                {/* Logged in user avatar */}
                                <span>
                                    <span className='m-2'>{cookies.get('username')}</span>
                                    <FontAwesomeIcon icon={faUserCircle} size='lg' color="#fff"
                                        className="rounded-circle me-5 mt-1"
                                        onClick={handleAvatarClick}
                                        style={{ cursor: 'pointer' }}
                                    />
                                </span>
                                {/* Dropdown menu */}
                                {isDropdownOpen && (
                                    <div className='mt-4' style={{ cursor: 'pointer', zIndex: -1000 }} onClick={handleLogout}>
                                        <span className='py-3 px-2 bg-light text-dark text-center rounded' style={{ listStyle: 'none' }}>
                                            Logout
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Your content goes here */}
                    <main className='d-flex justify-content-center align-items-center' style={{ height: '88%' }}>
                        {children}
                    </main>
                    {/* Footer */}
                    <div className="bg-purple container-fluid text-center" style={{ height: '5%' }}>
                        {/* Footer content goes here */}
                        &copy; 2024 - Begum Nusrat Bhutto University - All rights reserved.
                    </div>
                </div>

            </div>


        </div>
    );
}

export default Dashboard;
