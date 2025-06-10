import React from 'react';

const SelectReview = ({ reviews, selectedReview, setSelectedReview, handleChange}) => {

return (
    <div className="row mt-4">
        <div className='col-6'></div>    
        <div className='col-6'>
        <div className="mb-3 text-end">
        <label htmlFor="review-select" className="form-label">Review Cycle </label>
        <select
            id="review-select"
            className="form-select"
            value={selectedReview}
            onChange={handleChange}
            style={{ width: 'auto', display: 'inline-block' }} // opcional para achicar
        >
            <option value="">Seleccione una review</option>
            {reviews.map((review) => (
            <option key={review.id} value={review.id}>
                {review.name}
            </option>
            ))}
        </select>
        </div>
        </div>
    </div>
)}

export default SelectReview;