'use client';

import React, { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import html2pdf from 'html2pdf.js';
import { fetchData as fetchFromApi } from '@/server/services/core/fetchData';
import { useSession } from 'next-auth/react';
//import ImageResize from 'quill-image-resize-module-react';

import 'react-quill/dist/quill.snow.css';
import { Quill } from 'react-quill';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
//Quill.register('modules/imageResize', ImageResize);

export default function EditorPDF() {
  const [value, setValue] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedData, setSelectedData] = useState<any>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();

  // Lógica de búsqueda real a la API
  const handleSearch = async (search: string) => {
    console.log(search)
    try {
    //https://salaryback.binetz.com/api/v1/employees/all/?skip=1&limit=10&search=Carolina%20Castillo

      const res = await fetchFromApi(
        session?.user.token,
        'GET',
        `employees/all/?skip=1&limit=10&search=${search}`
      );
      console.log(res)
      setResults(res.data || []);
    } catch (error) {
      console.error('Error al buscar:', error);
      setResults([]);
    }

  };
  

  const handleSelect = (item: any) => {
    console.log(item)
    setSelectedData(item);
    setResults([]);
    setQuery('');
  };

  // const exportToPDF = () => {
  //   if (editorRef.current) {
  //     const opt = {
  //       margin: 0.5,
  //       filename: 'documento.pdf',
  //       image: { type: 'jpeg', quality: 0.98 },
  //       html2canvas: { scale: 2 },
  //       jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
  //     };

  //     html2pdf().set(opt).from(editorRef.current).save();
  //   }
  // };

  const exportToPDF = () => {
  if (editorRef.current) {
    const opt = {
      margin: 0.5,
      filename: 'documento.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    html2pdf()
      .set(opt)
      .from(editorRef.current)
      .outputPdf('blob') // 🔁 genera Blob en vez de guardar
      .then(async (blob) => {
        const formData = new FormData();
        formData.append('file', blob, 'documento.pdf');

        const response = await fetch('/api/send-pdf', {
          method: 'POST',
          body: formData,
        });

        console.log(response)

        alert('PDF enviado por email');
      });
  }
};

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'link'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean'],
    ],
    imageResize: {}, // habilita redimensión de imágenes
  };

  return (
    <>
    <div className='row'>
        <div className='col-6'>
          <button onClick={exportToPDF} className="btn btn-primary float-end">
              Exportar a PDF
          </button>
        </div>
      <div className="header">
            <img src='/header.png' width={'100%'} />
      </div>

      <div>

        <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">2024 Base Salary </th>
            <th scope="col">Salary Change (%)</th>
            <th scope="col">2025 Base Salary</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">1</th>
            <td>Mark</td>
            <td>Otto</td>
            <td>@mdo</td>
          </tr>
          <tr>
            <th scope="row">2</th>
            <td>Jacob</td>
            <td>Thornton</td>
            <td>@fat</td>
          </tr>
          <tr>
            <th scope="row">3</th>
            <td>John</td>
            <td>Doe</td>
            <td>@social</td>
          </tr>
        </tbody>
      </table>
      </div>

        {/* <div className='col-6'>
            
            <input
                type="text"
                placeholder="Buscar persona..."
                value={query}
                onChange={(e) => {
                const text = e.target.value;
                setQuery(text);
                if (text.length > 2) handleSearch(text);
                else setResults([]);
                }}
                className="form-control mb-4"
            />
        </div> 

 
        */}

        

      <div className='col-12'>
        <ReactQuill
          value={value}
          onChange={setValue}
          theme="snow"
          modules={modules}
          style={{ height: '450px', }}
        />

        <div style={{ display: 'none' }}>
          <div ref={editorRef} style={{ padding: '20px', fontFamily: 'Arial' }}>
            <div className="header">
              <img src="/header.png" width="100%" />
            </div>

            

            <div
              className="editor-content"
              style={{ marginTop: '20px' }}
              dangerouslySetInnerHTML={{ __html: value }}
            />

            <div className="table-container" style={{ marginTop: '20px' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>2024 Base Salary</th>
                    <th>Salary Change (%)</th>
                    <th>2025 Base Salary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>John</td>
                    <td>Doe</td>
                    <td>@social</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="footer" style={{ marginTop: '40px' }}>
              <img src="/footer.png" width="100%" />
            </div>
          </div>
        </div>

        {/* <div style={{ display: 'none' }}>
          <div ref={editorRef} style={{ padding: '20px', fontFamily: 'Arial' }}>
            <div className="header">
              <img src="/header.png" width="100%" />
            </div>

            <div className="table-container" style={{ marginTop: '20px' }}>
              <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>2024 Base Salary</th>
                    <th>Salary Change (%)</th>
                    <th>2025 Base Salary</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1</td>
                    <td>Mark</td>
                    <td>Otto</td>
                    <td>@mdo</td>
                  </tr>
                  <tr>
                    <td>2</td>
                    <td>Jacob</td>
                    <td>Thornton</td>
                    <td>@fat</td>
                  </tr>
                  <tr>
                    <td>3</td>
                    <td>John</td>
                    <td>Doe</td>
                    <td>@social</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div
              className="editor-content"
              style={{ marginTop: '20px' }}
              dangerouslySetInnerHTML={{ __html: value }}
            />

            <div className="footer" style={{ marginTop: '40px' }}>
              <img src="/footer.png" width="100%" />
            </div>
          </div>
        </div> */}

        <img src='/footer.png' width="100%" style={{ marginTop: '40px' }} />
          
      </div>
    </div>
        
    {/* Resultados de búsqueda */}
    {/* {results.length > 0 && (
        <ul className="list-group mb-4">
        {results.map((item) => (
            <li
            key={item.id}
            className="list-group-item list-group-item-action"
            style={{ cursor: 'pointer' }}
            onClick={() => handleSelect(item)}
            >
            {item.name}
            </li>
        ))}
        </ul>
    )} */}


    {/* Datos seleccionados */}
    {/* {selectedData && (
        <div className="alert alert-primary">
        <strong>{selectedData.id}</strong> <br></br>
        <strong>{selectedData.name}</strong> <br></br>
            <strong>{selectedData.actual_external_data.annual_salary}</strong> <br></br>
            <strong>{selectedData.actual_external_data.compensation_change_reason_description}</strong> <br></br>
        </div>
    )} */}
    </>


  
  );
}
