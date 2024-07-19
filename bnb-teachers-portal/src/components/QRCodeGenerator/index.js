import React, { useState, useEffect, useMemo, useCallback } from 'react';
import QRCode from 'qrcode.react';
import { server } from '../../helpers';
import { useAuth } from '../../providers';
import io from 'socket.io-client';
import { SERVER_URL } from '../../config';

const socket = io(SERVER_URL); // Assuming your server is running on localhost:3001


const QRCodeGenerator = ({ courseId, roomNumber }) => {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [session, setSession] = useState('');
    const [courseData, setCourseData] = useState(undefined);
    const [attendance, setAttendance] = useState([]);

    const { cookies } = useAuth();

    const data = JSON.stringify({
        geoLocation: [
            longitude,
            latitude
        ],
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

                    server.post('/api/sessions', {
                        geoLocation: [
                            position.coords.longitude.toString(),
                            position.coords.latitude.toString()
                        ],
                        courseId,
                        roomNumber,
                        teacher: cookies.get('id')
                    }).then((res) => {
                        setSession(res.data?._id);
                        server.get(`/api/courses/${courseId}`).then((response) => {
                            setCourseData(response.data)
                        });
                    });
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, [cookies, courseId, roomNumber]);


    useEffect(() => {
        // Listen for attendanceUpdated event from the server
        socket.on('attendanceMarked', ({ studentId, sessionId, status }) => {
            if (status)
                setAttendance(old => [...old, studentId])
            else
                setAttendance(old => old.filter(id => id !== studentId))
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


    // Inside handleToggle function in QRCodeGenerator component
    const handleToggle = useCallback(async (studentId, session) => {
        try {
            // Emit socket event to mark attendance
            socket.emit('markAttendance', { studentId: studentId, sessionId: session, isPresent: !attendance.includes(studentId) });

        } catch (error) {
            console.error('Error marking attendance:', error);
        }
    }, [attendance]);

    // Memoize the list of student components
    const memoizedStudentList = useMemo(() => {
        return courseData?.students.map((student) => (
            <div className='d-flex gap-2' key={student._id} style={{ marginTop: '10px' }}>
                <span>{student.user.first_name}</span>
                <div className="form-check form-switch">
                    <input
                        className="form-check-input"
                        type="checkbox"
                        id={`custom-switch-${student._id}`}
                        checked={attendance.includes(student._id)}
                        onChange={() => handleToggle(student._id, session)}
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
                alert('Session finished and absences marked.');
            } else {
                alert('No session active.');
            }
        } catch (error) {
            console.error('Error finishing session:', error);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            <div className='d-flex justify-content-end w-100 my-5'>
                <button className='btn btn-secondary rounded' onClick={handleFinishSession}>Finish Session</button>
            </div>
            {session && courseData ?
                <>
                    <h3> SESSION ID : {session}</h3>
                    <QRCode size={qrCodeSize} value={data} />
                    <hr />
                    <div>
                        <h3>Students</h3>
                        {memoizedStudentList}
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
