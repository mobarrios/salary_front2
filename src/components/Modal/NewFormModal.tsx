'use client';
import React, { useState } from "react";
import CloseButton from './CloseButton';
import { ModalContent, ModalOverlay } from "./StyleModal";

// Componente Modal
const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <ModalOverlay>
            <ModalContent>
                <CloseButton onClose={onClose} />
                {children}
            </ModalContent>
        </ModalOverlay>
    );
};



const NewFormModal = ({ itemId, name, FormComponent, type }) => {
    const [modalId, setModalId] = useState(null);
    const openModal = (id) => {
        setModalId(id);
    };

    const closeModal = () => {
        console.log("Cerrando modal");
        setModalId(null);
    };

    return (
        <>
            <button className="btn btn-primary" onClick={() => openModal(itemId)}>{name}</button>
            <Modal isOpen={modalId === itemId} onClose={closeModal}>
                <FormComponent type={type} id={modalId} onClose={closeModal} />
            </Modal>
        </>
    );
};

export default NewFormModal;