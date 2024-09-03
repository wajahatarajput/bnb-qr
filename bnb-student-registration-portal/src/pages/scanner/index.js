import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QRCodeScanner.css';
import io from 'socket.io-client';
import { SERVER_URL } from '../../config';
import { toast } from 'react-toastify';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const socket = io(SERVER_URL);

const QRCodeScanner = () => {
    const [scannedData, setScannedData] = useState(null);
    const [isCameraAvailable, setIsCameraAvailable] = useState(true);
    const [location, setLocation] = useState({
        longitude: 0,
        latitude: 0
    });
    const [fetchingLocation, setFetchingLocation] = useState(true);
    const [fingerprint, setFingerprint] = useState(null);
    const [error, setError] = useState(null);
    const qrCodeScannerRef = useRef(null);
    const qrCodeRegionId = "html5qr-code-full-region";

    const loadFingerprint = async () => {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);
        console.log(result.visitorId);
    };


    const haversineDistance = (coords1, coords2) => {
        const toRad = (value) => value * Math.PI / 180;

        const R = 6371e3; // Earth's radius in meters
        const lat1 = toRad(coords1.latitude);
        const lat2 = toRad(coords2.latitude);
        const deltaLat = toRad(coords2.latitude - coords1.latitude);
        const deltaLong = toRad(coords2.longitude - coords1.longitude);

        const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
            Math.cos(lat1) * Math.cos(lat2) *
            Math.sin(deltaLong / 2) * Math.sin(deltaLong / 2);

        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        const distance = R * c; // Distance in meters

        return distance;
    };

    useEffect(() => {
        // Fetch the location using the IP API and update the state
        const fetchLocation = async () => {
            try {
                const response = await fetch('https://ipinfo.io/json');
                const data = await response.json();
                const [latitude, longitude] = data.loc.split(',');
                setLocation({ latitude: parseFloat(latitude), longitude: parseFloat(longitude) });
                setFetchingLocation(false); // Stop fetching location
            } catch (error) {
                console.error('Error fetching location:', error);
                setError('Failed to fetch location');
                setFetchingLocation(false); // Stop fetching location even on error
            }
        };

        fetchLocation();

        socket.on('attendanceMarked', ({ student, status }) => {
            if (status && student === localStorage.getItem('id')) {
                toast.success('Attendance Marked Successfully!');
            } else {
                toast.error('Attendance Unsuccessful!');
            }
        });
    }, []);

    useEffect(() => {
        loadFingerprint();
        socket.on('fingerprintFound', () => {
            toast.error('Attendance Unsuccessful! Fingerprint Already Exists!');
        });
    }, []);

    useEffect(() => {
        if (scannedData) {
            const { sessionId, geoLocations: sessionLocation } = scannedData;

            if (sessionLocation && location.longitude !== 0 && location.latitude !== 0) {
                const [sLatitude, sLongitude] = sessionLocation;
                const sessionCoords = { latitude: sLatitude, longitude: sLongitude };
                const currentCoords = { latitude: location.latitude, longitude: location.longitude };

                const distance = haversineDistance(currentCoords, sessionCoords);

                alert(distance)

                if (distance <= 10) { // 10 meters
                    socket.emit('markAttendance', {
                        studentId: localStorage.getItem('id'),
                        sessionId,
                        isPresent: true,
                        fingerprint
                    });
                } else {
                    toast.error('You are not with in required distance to scan the QR!');
                }
            }
        }
    }, [location, scannedData, fingerprint]);

    useEffect(() => {
        const requestCameraPermission = async () => {
            try {
                const cameras = await Html5Qrcode.getCameras();
                if (cameras && cameras.length) {
                    qrCodeScannerRef.current = new Html5Qrcode(qrCodeRegionId);
                    qrCodeScannerRef.current.start(
                        { facingMode: "environment" },
                        {
                            fps: 50,
                            qrbox: { width: 500, height: 500 }
                        },
                        (decodedText) => {
                            setScannedData(JSON.parse(decodedText));
                            setError(null);
                            stopScanning();
                        },
                        (errorMessage) => {
                            if (errorMessage.name !== "NotFoundException") {
                                setError(errorMessage.message);
                            }
                        }
                    ).catch(err => {
                        console.error('Unable to start scanning:', err);
                        setIsCameraAvailable(false);
                        setError('Unable to start scanning');
                    });
                }
            } catch (error) {
                console.error('Error accessing camera:', error);
                setIsCameraAvailable(false);
                setError('Error accessing camera');
            }
        };

        const stopScanning = () => {
            if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning()) {
                qrCodeScannerRef.current.stop().then(() => {
                    console.log('QR Code scanning stopped.');
                    const element = document.getElementById(qrCodeRegionId);
                    if (element) {
                        element.innerHTML = '';
                    }
                }).catch(err => {
                    console.error('Error stopping QR Code scanner:', err);
                });
            } else {
                console.log('Scanner is not running.');
            }
        };

        if (!fetchingLocation) {
            requestCameraPermission();
        }

        return () => {
            stopScanning();
        };
    }, [fetchingLocation]);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1 className="mb-4">QR Scanner</h1>
                    {fetchingLocation ? (
                        <h5>Fetching your location...</h5>
                    ) : (
                        <h5>{`Your location is: ${location.longitude.toString()}, ${location.latitude.toString()}`}</h5>
                    )}
                    {!fetchingLocation && (
                        <div id={qrCodeRegionId} style={{ width: '100%' }}></div>
                    )}
                    {!isCameraAvailable && !fetchingLocation && (
                        <div className="alert alert-danger" role="alert">
                            Camera not available. Please check your permissions or try another device.
                        </div>
                    )}
                    {error && (
                        <div className="alert alert-danger mt-3" role="alert">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QRCodeScanner;
