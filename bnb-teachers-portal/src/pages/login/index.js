import React, { useEffect, useState } from 'react';
import logo from '../../assets/bnb.svg'
import { useAuth } from '../../providers';
import { useNavigate } from 'react-router-dom';

const Login = (props) => {
    const { type } = props;
    const { isAuthenticated, cookies, login } = useAuth();
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '' });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleShowPassword = () => {
        setShowPassword((prevShow) => !prevShow);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add your login logic here
        login({
            username: e.target[0].value,
            password: e.target[1].value,
            role: 'teacher'
        })
    };

    useEffect(() => {
        if (cookies.get('authToken'))
            navigate('/dashboard')
    }, [cookies, isAuthenticated, navigate])

    return (
        <div className="glassmorphism-container"> {/* Apply glassmorphism styling */}
            <div className="container">
                <div className="row justify-content-center align-items-center">
                    <div className="col-lg-6 d-none d-lg-block">
                        <img src={logo} alt="Logo" className="logo img-fluid" />
                    </div>
                    <div className="col-lg-6 col-md-8 col-sm-10">
                        <h2 className="mb-4">{type} Login</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="username" className="form-label">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    className="form-control"
                                    id="username"
                                    placeholder="Enter your username"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="password" className="form-label">
                                    Password
                                </label>
                                <div className="position-relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className="form-control"
                                        id="password"
                                        placeholder="Enter your password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="btn btn-link position-absolute end-0 top-50 translate-middle-y"
                                        onClick={handleShowPassword}
                                    >
                                        {showPassword ? <i className='fa fa-eye-slash' /> : <i className='fa fa-eye' />}
                                    </button>
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary w-100">
                                Login
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            {/* <ToastsContainer /> */}
        </div>
    );
};

export default Login;
