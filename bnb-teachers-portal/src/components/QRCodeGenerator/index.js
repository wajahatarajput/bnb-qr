import React, { useState, useEffect, useMemo, useCallback } from 'react';
import QRCode from 'qrcode.react';
import { server } from '../../helpers';
import { useAuth } from '../../providers';
import io from 'socket.io-client';
import { SERVER_URL } from '../../config';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const socket = io(SERVER_URL); // Assuming your server is running on localhost:3001

const QRCodeGenerator = ({ courseId, roomNumber }) => {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [session, setSession] = useState('');
    const [courseData, setCourseData] = useState(undefined);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [locationError, setLocationError] = useState('');
    const navigate = useNavigate();

    const { cookies } = useAuth();

    const data = JSON.stringify({
        geoLocations: [
            longitude,
            latitude
        ],
        sessionId: session,
        courseId,
        roomNumber,
        teacher: cookies.get('id')
    });

    useEffect(() => {
        // Fetch location using IPInfo API
        const fetchLocation = async () => {
            try {
                const response = await fetch('https://ipinfo.io/json');
                const locationData = await response.json();
                const [lat, lon] = locationData.loc.split(',');

                setLatitude(parseFloat(lat));
                setLongitude(parseFloat(lon));

                await server.post('/api/sessions', {
                    geoLocations: [lon, lat],
                    courseId,
                    roomNumber,
                    teacher: cookies.get('id')
                }).then((res) => {
                    setSession(res.data?._id);
                    server.get(`/api/coursescode/${courseId}`).then((response) => {
                        setCourseData(response.data);
                        setLoading(false);
                    });
                });
            } catch (error) {
                console.error('Error fetching location:', error);
                setLocationError('Error fetching location data.');
                setLoading(false);
            }
        };

        fetchLocation();
    }, [cookies, courseId, roomNumber]);

    useEffect(() => {
        // Listen for attendanceUpdated event from the server
        socket.on('attendanceMarked', ({ session, student, status }) => {
            if (status)
                setAttendance(old => [...old, student])
            else
                setAttendance(old => old.filter(id => id !== student))
        });

        // Clean up the socket event listener when component unmounts
        return () => {
            socket.off('attendanceMarked');
        };
    }, []);

    const isMobileDevice = () => {
        return window.innerWidth <= 768; // Adjust breakpoint as needed
    };

    useEffect(() => {
        // Set the confirmation message when the component mounts
        window.onbeforeunload = () => {
            return 'Refreshing this page will start a new Session';
        };

        // Clean up the event listener when the component unmounts
        return () => {
            window.onbeforeunload = null;
        };
    }, []);

    const handleToggle = useCallback(
        async (currentStudent, studentId, sessionId) => {
            try {
                // Determine the new isPresent status based on the current state
                const status = !attendance.includes(studentId); // Toggle the current state

                // Optionally define a fingerprint or unique identifier
                const fingerprint = studentId; // Use studentId as the fingerprint, or adjust as needed

                // Send the request to the API with all required parameters
                const response = await server.put(`/api/attendance/modify/${sessionId}/${studentId}`, {
                    isPresent: status,
                    fingerprint
                });

                const { isPresent, student } = response?.data;

                if (isPresent) {
                    setAttendance(old => [...old, student]);
                }
                else {
                    setAttendance(old => old.filter(id => id !== student));
                }

            } catch (error) {
                console.error('Error toggling attendance:', error);
            }
        },
        [attendance]
    );

    // Memoize the list of student components
    const memoizedStudentList = useMemo(() => {
        return courseData?.students.map((student) => (
            <div className="d-flex gap-2 align-items-center" key={student._id} style={{ marginTop: '10px' }}>
                <span className='w-75 text-truncate'>{student?.user?.first_name}</span>
                <div className="form-check form-switch w-25">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`custom-switch-${student?.user?._id}`}
                        checked={attendance.includes(student?.user?._id)}
                        onChange={() => handleToggle(student?._id, student?.user?._id, session)}
                        aria-label={`Toggle attendance for ${student?.user?.first_name}`}
                    />
                </div>
            </div>
        ));
    }, [courseData, session, attendance, handleToggle]);

    // Determine the QR code size based on the device
    const qrCodeSize = isMobileDevice() ? 300 : 500;

    const handleFinishSession = async () => {
        try {
            if (session) {
                await server.post(`/finishSession/${session}`);
                navigate('/class')
                toast.success('Session finished and absences marked.');
            } else {
                toast.error('No session active.');
            }
        } catch (error) {
            toast.error('Error finishing session:', error);
        }
    };

    return (
        <div className='d-flex justify-content-center align-items-center w-100 flex-column p-5'>
            <div className='d-flex justify-content-end w-100 my-5'>
                <button className='btn btn-secondary rounded' onClick={handleFinishSession}>Finish Session</button>
            </div>
            {loading ? (
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            ) : locationError ? (
                <div className="alert alert-danger" role="alert">
                    {locationError}
                </div>
            ) : session && courseData ? (
                <>
                    <h3> SESSION ID : {session}</h3>
                    <h5> Course Name : {courseData?.name}</h5>
                    <div className='d-block d-md-flex flex-row gap-3'>
                        <QRCode size={qrCodeSize} value={data} />
                        <hr />
                        <div className='bg-dark text-light p-5'>
                            <h3>Students</h3>
                            <hr />
                            {memoizedStudentList}
                        </div>
                    </div>
                </>
            ) : (
                <div className="alert alert-warning" role="alert">
                    No session data available.
                </div>
            )}
        </div>
    );
};

export default QRCodeGenerator;
