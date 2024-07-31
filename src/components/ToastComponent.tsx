'use client'

import { useState } from 'react';
import Toast from 'react-bootstrap/Toast';
import ToastContainer from 'react-bootstrap/ToastContainer';

function ToastComponent({ show, message }) {
    const [position, setPosition] = useState('bottom-end');
    const [showA, setShowA] = useState(true);
    const [showB, setShowB] = useState(true);

    const toggleShowA = () => setShowA(!showA);
    const toggleShowB = () => setShowB(!showB);

    return (
        <>
            <ToastContainer
                className="p-3"
                position={position}
                style={{ zIndex: 1 }}

            >
                <Toast show={showB} onClose={toggleShowB}>
                    <Toast.Header closeButton={true}>
                        <strong className="me-auto">Message</strong>
                        <small>11 mins ago</small>
                    </Toast.Header>
                    <Toast.Body>{message}.</Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}

export default ToastComponent;