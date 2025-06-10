import React from 'react';
import { formatDate } from "@/functions/formatDate";

const TodoList = ({ teamUser }) => {
    return (
        
        <div className="card">
            <div className="card-body">
                <div className="col-12">
                {
                    teamUser.length > 0 ? (
                    teamUser.map((review, id) => (
                        <div className="row m-2" key={review.id}>
                        <div className="col-3">
                            {review.teamName}
                        </div>
                        <div className="col-3">
                            
                        </div>
                        <div className="col-4">
                            <span className="badge rounded-pill bg-danger">Pending</span>
                        </div>
                        <div className="col-2">
                            <a
                            href={`/admin/reviews/teams/${review.teams_id}/${review.reviews_id}`}
                            className="btn btn-success ms-2">
                            <i className="bi bi-pencil"></i>
                            </a>
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