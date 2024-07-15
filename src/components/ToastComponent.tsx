import { useState } from 'react';
import { Toast } from 'react-bootstrap';


export const ToastComponent = ({ show, message }) => {

    const [showToast, setShowToast] = useState(show);

    return (
        <Toast 
            show={showToast} 
            onClose={() => setShowToast(false)} 
            delay={3000}
            autohide>
            <Toast.Header>
                <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body>{message}</Toast.Body>
        </Toast>
    )

}