import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QRCodeScanner.css'; // Import your custom CSS file

const QRCodeScanner = () => {
    const [scannedData, setScannedData] = useState('');
    const [isCameraAvailable, setIsCameraAvailable] = useState(true);
    const [error, setError] = useState(null);
    const qrCodeScannerRef = useRef(null);
    const qrCodeRegionId = "html5qr-code-full-region";

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
                            setScannedData(decodedText);
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
            if (qrCodeScannerRef.current) {
                qrCodeScannerRef.current.stop().then(() => {
                    console.log('QR Code scanning stopped.');
                    // Clear the element contents to ensure no further issues
                    const element = document.getElementById(qrCodeRegionId);
                    if (element) {
                        element.innerHTML = '';
                    }
                }).catch(err => {
                    console.error('Error stopping QR Code scanner:', err);
                });
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
                    {isCameraAvailable ? (
                        <div id={qrCodeRegionId} style={{ width: '100%' }}></div>
                    ) : (
                        <div className="alert alert-danger" role="alert">
                            Camera not available. Please check your permissions or try another device.
                        </div>
                    )}
                    {scannedData && (
                        <div className="alert alert-success mt-3" role="alert">
                            Scanned Data: {scannedData}
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
