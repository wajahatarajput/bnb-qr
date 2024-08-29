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
        // Get user's current location using Geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setLatitude(position.coords.latitude);
                    setLongitude(position.coords.longitude);

                    console.log(position);

                    server.post('/api/sessions', {
                        geoLocations: [
                            position.coords.longitude,
                            position.coords.latitude
                        ],
                        courseId,
                        roomNumber,
                        teacher: cookies.get('id')
                    }).then((res) => {
                        setSession(res.data?._id);
                        server.get(`/api/courses/${courseId}`).then((response) => {
                            setCourseData(response.data);
                            setLoading(false);
                        });
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                },
                {
                    enableHighAccuracy: true, // Request high accuracy
                    timeout: 5000,            // Optional: Set timeout (in milliseconds)
                    maximumAge: 0             // Optional: Do not use cached location
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, [cookies, courseId, roomNumber]);



    useEffect(() => {
        // Listen for attendanceUpdated event from the server
        socket.on('attendanceMarked', ({ session, student, status }) => {
            console.log(student, session)
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
        async (studentId, session) => {
            try {
                const isPresent = !attendance.includes(studentId); // Toggle the current state
                socket.emit('markAttendance', { studentId, sessionId: session, isPresent, fingerprint: studentId }); // Emit socket event
            } catch (error) {
                console.error('Error marking attendance:', error);
                // Handle error, maybe show a toast or alert to the user
            }
        },
        [attendance]
    );


    // Memoize the list of student components
    const memoizedStudentList = useMemo(() => {
        return courseData?.students.map((student) => (
            <div className="d-flex gap-2 align-items-center" key={student._id} style={{ marginTop: '10px' }}>
                <span className='w-75 text-truncate'>{student.user.first_name}</span>
                <div className="form-check form-switch w-25">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`custom-switch-${student?.user._id}`}
                        checked={attendance.includes(student?.user._id)}
                        onChange={() => handleToggle(student?.user._id, session)}
                        aria-label={`Toggle attendance for ${student.user.first_name}`}
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
            {session && courseData && !loading ?
                <>
                    <h3> SESSION ID : {session}</h3>

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
                :
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            }

        </div>
    );
};

export default QRCodeGenerator;
