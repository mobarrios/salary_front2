import styled from 'styled-components';

// Estilos para el modal
export const ModalOverlay = styled.div`
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

export const ModalContent = styled.div`
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