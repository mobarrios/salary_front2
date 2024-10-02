'use client'
import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import Link from 'next/link';
import { useEffect, useState } from 'react';


export default function Upload() {


  const [file, setFile] = useState(null);
  const [ status , setStatus ] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
useEffect(() => {

  }, [status]);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    setIsLoading(true)

    try {
      // const response = await fetch('http://localhost:8000/api/v1/uploads/uploads', {
       const response = await fetch(process.env.API_SALARY+'/uploads/uploads', {
         method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('File uploaded successfully', data);
      setStatus(data.message)
      setIsLoading(false)
    } catch (error) {
      console.error('Error uploading file', error);
      setStatus(error)
    }
  };


  return (
  <div className='container'>
    <h2 className='text-primary '>Upload Data</h2>
    <div className="row">
        <div className='col-12'>

        <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit">Upload</button>
        </form>
        <>
        <span className='mt-5 text-success'>{status}</span>
        </>
        </div>
       
    </div>
  </div>
  )
};