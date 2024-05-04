import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';
import { server } from '../../helpers';
import { useAuth } from '../../providers';

const QRCodeGenerator = ({ courseId, roomNumber }) => {
    const [latitude, setLatitude] = useState(0);
    const [longitude, setLongitude] = useState(0);
    const [session, setSession] = useState('');
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
                        setSession(res.data?._id)
                    })
                },
                (error) => {
                    console.error('Error getting location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }, [cookies, courseId, roomNumber]);

    console.log(data)

    return (
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

            {session ?
                <>
                    <h3> SESSION ID : {session}</h3>
                    <QRCode size={500} value={data} />
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
