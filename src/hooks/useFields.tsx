export const useFields = (headers) => {
    const fields = headers.map(header => {
        
        const field = { key: header.key }; 
        if (header.type) {
            field.type = header.type; 
        }
        if (header.options) { // Verifica si hay opciones
            field.options = header.options; // Agrega las opciones al campo
        }
        if (header.name) {
            field.name = header.name; 
        }
        return field;
    });
    return fields;
};