import React from 'react';

const TodoList = ({ teamUser, selectedReview }) => {

    const reviewsFiltradas = teamUser.filter(review => review.reviews_id == selectedReview);
    
    return (
        <div className="card mt-4">
            <div className="card-body">
                <div className="col-12">
                {
                    reviewsFiltradas.length > 0 ? (
                        reviewsFiltradas.map((review) => (
                        <div className="row m-2" key={review.id}>
                            <div className="col-3">
                            {review.teamName}
                            </div>
                            <div className="col-3">
                            {/* contenido opcional */}
                            </div>
                            <div className="col-4">
                            <span
                            className={`badge rounded-pill ${
                                review.status == 3 ? 'bg-success' : 'bg-danger'
                            }`}
                            >
                            {review.status == 3 ? 'Approved' : 'Pending'}
                            </span>

                            {/* {review.status === 3 ? (
                            <span className="badge rounded-pill bg-success">Done</span>
                            ) : review.status === 2 ? (
                            <span className="badge rounded-pill bg-dark">In Progress</span>
                            ) : review.status ? (
                            <span className="badge rounded-pill bg-dark">Started</span>
                            ) : (
                            <span className="badge rounded-pill bg-danger">Not started</span>
                            )} */}
                            
                            </div>
                            <div className="col-2">
                                {(review.status === 1 || review.status === 2) && (
                                <a
                                    href={`/admin/reviews/teams/${review.teams_id}/${review.reviews_id}`}
                                    className="btn btn-sm btn-success ms-2"
                                >
                                    <i className="bi bi-pencil"></i>
                                </a>
                                )}
                            </div>
                        </div>
                        ))
                    ) : (
                        <p className="text-muted">No hay reviews pendientes.</p>
                    )
                }
                </div>
            </div>
        </div>
    );
};

export default TodoList;