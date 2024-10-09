'use client'
import Link from "next/link";
import { useRef } from "react";

const SearchBar = () => {

    const clickPoint = useRef();
    const handleFocus = () => {
        //clickPoint.current.style.display = "none";
    };

    const handleBlur = () => {
        //clickPoint.current.style.display = "block";
    };

    return (

        <form className="d-flex">
            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" />
            <button className="btn btn-outline-primary" type="submit">Search</button>
        </form>

    );
}

export default SearchBar