import React from 'react';

const RatingRow = ({ option, item, isManager, isCheckboxChecked, isValidator }) => {
    return (

        <tr>
            <td>
                <div className="form-check form-switch">
                    {isManager && (
                        <input
                            className="form-check-input"
                            checked={isCheckboxChecked(option.id, item.id)}
                            type="checkbox"
                            role="switch"
                            name="roles_id"
                            id={option.id}
                            value={option.id !== null ? option.id : undefined}
                            onChange={(e) => handleCheckboxChange(option.id, item.id, e.target.checked)}
                        />
                    )}
                    <label className="form-check-label" htmlFor={option.id}>{option.name}</label>
                </div>
            </td>
            <td>
                <input
                    type='number'
                    disabled={!isCheckboxChecked(option.id, item.id)}
                    step={1}
                    min={option.percent_min}
                    max={option.percent_max}
                    value={rangeValues[`${option.id}-${item.id}`] || 0}
                    onChange={(e) => handleRangeChange(e, option.id, item.id)}
                />
                {/* <div className="row ">
                        <div className="col-2">
                            <small>{option.percent_min} %</small>
                        </div>
                        <div className="col-8">
                            <input 
                                type='number'
                                disabled={!isCheckboxChecked(option.id, item.id)}
                                step={1}
                                min={option.percent_min}
                                max={option.percent_max}
                                value={rangeValues[`${option.id}-${item.id}`] || 0}
                                //onChange={(e) => handleRangeChange(e, option.id, item.id)}
                            />
                          
                        </div>
                        <div className="col-2"><small>{option.percent_max} %</small> {rangeValues[`${option.id}-${item.id}`] || 0}</div>
                    </div> */}
            </td>
            <td>
                <input
                    disabled={!isCheckboxChecked(option.id, item.id)}
                    type="text"
                    placeholder="Comments"
                    value={commnetsValues[`${option.id}-${item.id}`]}
                    onChange={(e) => {
                        const newCommnetsValues = { ...commnetsValues };
                        newCommnetsValues[`${option.id}-${item.id}`] = e.target.value;
                        setCommnetsValues(newCommnetsValues);
                    }}
                />
            </td>
            {/* <td>
                <button
                    disabled={!isCheckboxChecked(option.id, item.id)}
                    className='btn btn-primary btn-xs'
                    onClick={(e) => handleSubmit(e, item.id, option.id)}
                >
                    <i className="bi bi-update"></i> update
                </button>
            </td> */}
            {/* {isValidator && (
                    <>
                        <td>
                            <a className='btn btn-primary btn-xs' onClick={(e) => changeStatusByRatings(e, item.id, option.id, 1)}>pending</a>
                        </td>
                        <td>
                            <a className='btn btn-primary btn-xs' onClick={(e) => changeStatusByRatings(e, item.id, option.id, 2)}>aproved</a>
                        </td>
                        <td>
                            <a className='btn btn-primary btn-xs' onClick={(e) => changeStatusByRatings(e, item.id, option.id, 3)}>rejected</a>
                        </td>
                    </>
                )} */}
        </tr>
    );
};

export default RatingRow;