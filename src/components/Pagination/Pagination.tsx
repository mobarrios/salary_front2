
'use client';

import Link from "next/link";
import { useState } from "react";

const Pagination = ({ totalPages, page }) => {


    const prevPage = page - 1 > 0 ? page - 1 : 1;
    const nextPage = page + 1;
    const isPageOutOfRange = page > totalPages;

    const pageNumbers = [];
    const offsetNumber = 3;
    for (let i = page - offsetNumber; i <= page + offsetNumber; i++) {
        if (i >= 1 && i <= totalPages) {
            pageNumbers.push(i);
        }
    }

    return (

        <nav aria-label="...">
            <ul className="pagination">
                <li className="page-item disabled">
                    <span className="page-link">Anterior</span>
                </li>

                {
                    pageNumbers.map((pageNumber, index) => (
                        <li key={index} className="page-item">

                            <Link
                                className={page === pageNumber
                                    ? "page-link"
                                    : "page-link"
                                }
                                href={`?page=${pageNumber}`}
                            >{pageNumber}
                            </Link>
                        </li>
                    ))
                }


                <li className="page-item">
                    <a className="page-link" href="#">Siguiente</a>
                </li>
            </ul>
        </nav>

        /* <nav>
        <ul className="flex flex-wrap items-center gap-2">
            <li>
                {page === 1 ? (
                    <Link
                        className="flex items-center justify-center rounded bg-[#EDEFF1] px-3 py-1.5 text-xs font-medium text-black hover:bg-primary hover:text-white dark:bg-graydark dark:text-white dark:hover:bg-primary dark:hover:text-white"
                        href="#">
                        Anterior
                    </Link>
                ) : (
                    <Link
                        href={`?page=${prevPage}`}
                        className="flex items-center justify-center rounded bg-[#EDEFF1] px-3 py-1.5 text-xs font-medium text-black hover:bg-primary hover:text-white dark:bg-graydark dark:text-white dark:hover:bg-primary dark:hover:text-white"
                    >
                        Anterior
                    </Link>

                )}
            </li>

            {
                pageNumbers.map((pageNumber, index) => (
                    <li key={index}>

                        <Link
                            className={page === pageNumber
                                ? "flex items-center justify-center rounded px-3 py-1.5 font-medium bg-primary text-white"
                                : "flex items-center justify-center rounded px-3 py-1.5 font-medium hover:bg-primary hover:text-white"
                            }
                            href={`?page=${pageNumber}`}
                        >{pageNumber}
                        </Link>
                    </li>
                ))
            }

            <li>
                {page === totalPages ? (
                    <Link
                        className="flex items-center justify-center rounded bg-[#EDEFF1] px-3 py-1.5 text-xs font-medium text-black hover:bg-primary hover:text-white dark:bg-graydark dark:text-white dark:hover:bg-primary dark:hover:text-white"
                        href="#">
                        Siguiente 
                    </Link>
                ) : (

                    <Link
                        className="flex items-center justify-center rounded bg-[#EDEFF1] px-3 py-1.5 text-xs font-medium text-black hover:bg-primary hover:text-white dark:bg-graydark dark:text-white dark:hover:bg-primary dark:hover:text-white"
                        //href={`?page=${nextPage}`}
                        href={isPageOutOfRange ? '' : `?page=${nextPage}`}

                        aria-label="Next Page">
                        Siguiente
                    </Link>

                )}
            </li>
        </ul>
        </nav> */
       
        
    );
};

export default Pagination;
