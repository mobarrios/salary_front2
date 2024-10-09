export const formatDate = (dateString) => {
    const date = new Date(dateString);
    const adjustedDate = new Date(date.getTime() + 5 * 60 * 60 * 1000);
    return adjustedDate.toLocaleDateString('en-EN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

export const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
        return '0.00'; // o puedes usar 'N/A' o cualquier valor predeterminado que prefieras
    }
    return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
