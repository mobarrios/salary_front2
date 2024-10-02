'use client'
import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Title } from '@/components/Title';
import { Modal, Button } from 'react-bootstrap';
import { showErrorAlert, showSuccessAlert } from '@/hooks/alerts';


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
       const response = await fetch(process.env.NEXT_PUBLIC_SALARY+'/uploads/uploads', {
         method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('File uploaded successfully. ', data);
      // setStatus(data.message)
      showSuccessAlert(data.message)
    } catch (error) {
      console.error('Error uploading file', error);
      // setStatus(error)
      showErrorAlert(error)
    }
    finally{
      setIsLoading(false)
    }

  };


  return (
  <div>
    <Title>Import data</Title>

    <div className="row pt-3">
        <div className='col-12'>

        <form>
        <p><input type="file" onChange={handleFileChange} /></p>
        {/* <p><button className="btn btn-primary" type="submit">Upload</button></p> */}
         <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Uploading...' : 'Upload'}
          </Button>
        </form>
        <>
        <h4 className='mt-3 text-default'>{status}</h4>
        </>
        </div>
       
    </div>
  </div>
  )
};