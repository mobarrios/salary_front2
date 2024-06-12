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

        <form method="GET" action="">
            <div className="bg-white border-1  shadow p-2 relative rounded-xl flex">
                <span className="w-auto flex justify-end  items-center text-gray-500 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                    </svg>
                </span>
                <input name="episodequery" id="title" className="border-white outline-none border-0 w-full rounded-xl p-2" type="text" placeholder="search..." />
                <button type="submit" className="bg-blue-500 hover:bg-gray-700 rounded-xl text-white text-xl p-2 pl-4 pr-4 ml-2">
                    <p className="font-semibold text-xs">Search</p>
                </button>
            </div>
        </form>

    );
}

export default SearchBar