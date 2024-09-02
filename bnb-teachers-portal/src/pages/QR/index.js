import React from 'react';
import { useLocation } from 'react-router-dom';
import QRCodeGenerator from '../../components/QRCodeGenerator';

const QRCodeGeneratorPage = () => {
    const location = useLocation();
    const { session, courseData, data } = location.state || {};

    if (!session || !courseData || !data) {
        return (
            <div className="container mt-5 text-center">
                <p>Missing data for QR code generation.</p>
            </div>
        );
    }

    // Encode the JSON data into a URL-safe format
    // const encodedData = encodeURIComponent(data);

    return (
        <QRCodeGenerator session={session} courseData={courseData} data={data} />
    );
};

export default QRCodeGeneratorPage;
