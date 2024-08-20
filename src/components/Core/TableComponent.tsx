'use client';
import React, { useState } from "react";
import EditButton from "./EditButton";
import RemoveItem from "./RemoveItem";
import Link from "next/link";
import ModalButton from "../Modal/ModalButton";

const TableComponent = ({ data, model, headers, buttonExtra = [] }) => {

    return (
        <div>
            <table className="table table-striped">
                <thead>
                    <tr>
                        <th>#</th>
                        {headers.map((header, key) => (
                            <th scope="col" key={key}>{header.name}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {
                        data ? (
                            data.map((item, rowIndex) => (
                                <tr className="align-middle" key={rowIndex}>
                                    <td>{item.id}</td>
                                    {headers.map((header, colIndex) => (
                                        <td key={header.key}>{item[header.key]}</td>
                                    ))}
                                    <td>
                                        <EditButton url={model} id={item.id} />
                                        {buttonExtra && buttonExtra.map((campo, campoIndex) => (
                                            <React.Fragment key={`${item.id}-${campoIndex}`}>
                                                {campo.type === 'modal' ? (
                                                    <ModalButton itemId={item.id} name='Teams' />
                                                ) : (
                                                    <Link
                                                        href={`/${campo.url}/${item.id}`}
                                                        className="btn btn-warning m-1"
                                                    >
                                                        {campo.name}
                                                    </Link>
                                                )}
                                            </React.Fragment>
                                        ))}
                                        <RemoveItem url={model} id={item.id} />

                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={headers.length + 2}>No data available</td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </div>
    );
};

export default TableComponent;