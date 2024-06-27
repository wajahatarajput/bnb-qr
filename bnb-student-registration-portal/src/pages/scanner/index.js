import React, { useState, useEffect, useRef, useImperativeHandle } from 'react';
import { QrReader } from 'react-qr-reader';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QRCodeScanner.css'; // Import your custom CSS file

const QRCodeScanner = () => {
    const [scannedData, setScannedData] = useState('');
    const [isCameraAvailable, setIsCameraAvailable] = useState(true);
    const readerRef = useRef(null);

    useEffect(() => {
        const requestCameraPermission = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { ideal: 'environment' } },
                    audio: false,
                });
                readerRef.current.srcObject = stream;
                setIsCameraAvailable(true);
            } catch (error) {
                console.error('Error accessing camera:', error);
                setIsCameraAvailable(false);
            }
        };

        if ('mediaDevices' in navigator) {
            requestCameraPermission();
        }
    }, []);

    const handleScan = (data) => {
        if (data) {
            setScannedData(data);
        }
    };

    const handleError = (error) => {
        console.error('Error with QR code scanner:', error);
        setIsCameraAvailable(false);
    };

    useImperativeHandle(readerRef, () => ({
        triggerScan: () => {
            readerRef.current.handleImage(null);
        },
    }));

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 text-center">
                    <h1 className="mb-4">QR Scanner</h1>
                    {isCameraAvailable ? (
                        <div className="qr-reader-wrapper">
                            <QrReader
                                key="environment"
                                constraints={{ facingMode: 'environment' }}
                                ref={readerRef}
                                onScan={handleScan}
                                onError={handleError}
                                style={{ width: '100%' }}
                                facingMode={'environment'}
                                reactivate
                            />
                        </div>
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
                </div>
            </div>
        </div>
    );
};

export default QRCodeScanner;
