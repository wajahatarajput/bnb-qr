import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QRCodeScanner.css'; // Import your custom CSS file
import io from 'socket.io-client';
import { SERVER_URL } from '../../config';
import { toast } from 'react-toastify';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

const socket = io(SERVER_URL); // Assuming your server is running on localhost:3001

const QRCodeScanner = () => {
    const [scannedData, setScannedData] = useState(null);
    const [isCameraAvailable, setIsCameraAvailable] = useState(true);
    const [location, setLocation] = useState({
        longitude: 0,
        latitude: 0
    })
    const [fingerprint, setFingerprint] = useState(null);
    const [error, setError] = useState(null);
    const qrCodeScannerRef = useRef(null);
    const qrCodeRegionId = "html5qr-code-full-region";

    const loadFingerprint = async () => {
        const fp = await FingerprintJS.load();
        const result = await fp.get();
        setFingerprint(result.visitorId);

        console.log(result.visitorId)
    };

    useEffect(() => {
        window.navigator.geolocation.getCurrentPosition(
            (pos) => {
                setLocation(pos.coords);
            },
            (error) => {
                console.error(error);
            },
            {
                enableHighAccuracy: true, // Request high accuracy
                timeout: 5000,            // Optional: Set timeout (in milliseconds)
                maximumAge: 0             // Optional: Do not use cached location
            }
        );
        socket.on('attendanceMarked', ({ student, status }) => {
            if (status && student === localStorage.getItem('id')) {
                toast.success('Attendance Marked SuccessFul!');
            }
            else
                toast.error('Attendance Unsuccessful!')
        });
    }, []);

    useEffect(() => {
        loadFingerprint();
        socket.on('fingerprintFound', (data) => {
            toast.error('Attendance Unsuccessful! Fingerprint Already Exist!')
        });
    }, []);

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
        if (scannedData) {
            const { sessionId, geoLocations: sessionLocation } = scannedData;

            if (sessionLocation && location.longitude !== 0 && location.latitude !== 0) {
                const [sLatitude, sLongitude] = sessionLocation;
                const sessionCoords = { latitude: sLatitude, longitude: sLongitude };
                const currentCoords = { latitude: location.latitude, longitude: location.longitude };

                const distance = haversineDistance(currentCoords, sessionCoords);

                if (distance <= 10) { // 10 meters
                    socket.emit('markAttendance', {
                        studentId: localStorage.getItem('id'),
                        sessionId,
                        isPresent: true,
                        fingerprint
                    });
                } else {
                    toast.error('You are not within the required location range to mark attendance.');
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
                            fps: 10, // Optional, frame per seconds for qr code scanning
                            qrbox: { width: 250, height: 250 } // Optional, if you want bounded box UI
                        },
                        (decodedText, decodedResult) => {
                            // Handle on success condition with the decoded text or result.

                            setScannedData(JSON.parse(decodedText));
                            alert(decodedText);
                            setError(null); // Clear any previous errors
                            stopScanning();
                        },
                        (errorMessage) => {
                            // Handle parse error, ignore repetitive errors
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
            try {
                if (qrCodeScannerRef.current && qrCodeScannerRef.current.isScanning()) {
                    qrCodeScannerRef.current.stop()
                        .then(() => {
                            console.log('QR Code scanning stopped.');
                            // Clear the element contents to ensure no further issues
                            const element = document.getElementById(qrCodeRegionId);
                            if (element) {
                                element.innerHTML = '';
                            }
                        })
                        .catch(err => {
                            console.error('Error stopping QR Code scanner:', err);
                        });
                } else {
                    console.log('Scanner is not running.');
                }
            } catch (error) {
                console.error('Error stopping QR Code scanner:', error);
            }
        };

        requestCameraPermission();

        return () => {
            stopScanning();
        };
    }, []);

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1 className="mb-4">QR Scanner</h1>
                    <h5> {`Your location is : ${location.longitude.toString()}, ${location.latitude.toString()}`}</h5>
                    {isCameraAvailable && location.longitude !== 0 ? (
                        <div id={qrCodeRegionId} style={{ width: '100%' }}></div>
                    ) : (
                        <div className="alert alert-danger" role="alert">
                            Camera not available. Please check your permissions or try another device.
                        </div>
                    )}
                    {scannedData && (
                        <div className="alert alert-success mt-3" role="alert">
                            Scanned Data: {scannedData.sessionId}
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
