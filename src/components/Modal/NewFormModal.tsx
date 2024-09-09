'use client';
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import Modal from 'react-bootstrap/Modal';

// Componente Modal
const ModalComp = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <Modal size="lg" fade show={true} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title><strong>dasds {title} </strong></Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {/* <Button variant="primary">
          Save Changes
        </Button> */}
      </Modal.Footer>
    </Modal>
  );
};


const NewFormModal = ({ itemId, name, FormComponent, type, title }) => {
  const [modalId, setModalId] = useState(null);
  const openModal = (id) => {
    setModalId(id);
  };

  const closeModal = () => {
    setModalId(null);
  };

  return (
    <>
      {name === 'Edit' ?
        <button className="btn btn-light ms-2" onClick={() => openModal(itemId)}><i className="bi bi-pencil"></i></button> :
        <button className="btn btn-outline-primary ms-2" onClick={() => openModal(itemId)}>{name}</button>}
      <ModalComp isOpen={modalId === itemId} onClose={closeModal} title={title} >
        <FormComponent type={type} id={modalId} onClose={closeModal} />
      </ModalComp>
    </>
  );
};

export default NewFormModal;