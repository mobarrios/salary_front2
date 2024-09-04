import React from 'react';

const CloseButton = ({ onClose }) => {
    return (
        <button
            onClick={onClose}
            style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '10px 15px',
                borderRadius: '5px',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
                float: 'right'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
            Cerrar
        </button>
    );
};

export default CloseButton;