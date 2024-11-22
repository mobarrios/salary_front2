'use client';
import React, { useState } from "react";
import styled from 'styled-components';
import FormEmployees from '@/app/admin/employees/teams/page';

// Componente Modal
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <ModalOverlay>
      <ModalContent>
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
            float:'right'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
        >
          Cerrar
        </button> 
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

// Estilos para el modal
const ModalOverlay = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
`;

const ModalContent = styled.div`
    background: white;
    padding: 30px;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    width: 90vw; /* 90% del ancho de la ventana */
    max-width: 900px; /* Ancho máximo */
    height: auto; /* Permite que la altura sea automática */
    max-height: 90vh; /* Altura máxima */
    overflow-y: auto; /* Permite el desplazamiento vertical si el contenido excede la altura máxima */
`;

const ModalButton = ({ itemId, name }) => {
  const [modalId, setModalId] = useState(null);
  const openModal = (id) => {
    setModalId(id);
  };

  const closeModal = () => {
    setModalId(null);
  };

  return (
    <>
      <button className="btn btn-warning m-1" onClick={() => openModal(itemId)}>{name}</button>
      <Modal isOpen={modalId === itemId} onClose={closeModal}>
        <FormEmployees id={modalId} />
      </Modal>
    </>
  );
};

export default ModalButton;