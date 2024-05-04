import React from 'react'
import QRCodeGenerator from '../../components/QRCodeGenerator'
import { useLocation } from 'react-router-dom';

const QRPage = () => {

    const location = useLocation();
    const { courseId, roomNumber } = location.state;

    return (
        <QRCodeGenerator courseId={courseId} roomNumber={roomNumber} />
    )
}

export default QRPage
