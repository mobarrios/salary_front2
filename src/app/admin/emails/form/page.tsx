'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData';
import Link from 'next/link';

export default function Form() {
  const editorRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [modalSend, setModalSend] = useState(false);

  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHeaderFile(file);
      setHeaderImage(URL.createObjectURL(file)); // Para preview si querés
    }
  };

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFooterFile(file);
      setFooterImage(URL.createObjectURL(file)); // Para preview si querés
    }
  };

  useEffect(() => {
    const load = async () => {
      if (session?.user.token) {
        try {
          //const res = await fetchData(session?.user.token, 'GET', `${name}/all/?skip=${(page - 1) * limit}&limit}`);
          const res = await fetchData(session?.user.token, 'GET', `reviews/all/?skip=0&limit=1000`);
          
          if (res && res.data) {
            console.log(res)
            setReviews(res.data);
            //setResults(res.data); // Establece los resultados
            //setTotalCount(res.count); // Establece el total de conteo
            // 

          } else {
            console.error("No se recibieron datos válidos:", res);
          }
        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      }
    };
    load();
  }, [session?.user.token]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const fileUpload = async (file: File, field: string) => {
      const formData = new FormData();
      formData.append(field, file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir archivo");

        const data = await res.json();
        return data.filename; // nombre generado por el backend
    };

    try {
      // 1. Subir archivos
      let headerFileName = null;
      let footerFileName = null;

      if (headerFile) {
        headerFileName = await fileUpload(headerFile, "header");
      }

      if (footerFile) {
        footerFileName = await fileUpload(footerFile, "footer");
      }

      // 2. Enviar todo al backend
      const payload = {
        title,
        content1,
        content2,
        content3,
        headerImage: headerFileName,
        footerImage: footerFileName,
      };

      // const saveRes = await fetch("/api/save", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify(payload),
      // });

      // if (!saveRes.ok) throw new Error("Error al guardar datos");

      // const saved = await saveRes.json();
      
      // console.log("Guardado en base de datos:", saved);

    } catch (err) {
      console.error("Error al enviar formulario:", err);
    }

  };


  return (
    <>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="mb-3">
            <label className="form-label">Header</label>
            <input
              type="file"
              className="form-control"
              onChange={handleHeaderChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Footer</label>
            <input
              type="file"
              className="form-control"
              onChange={handleFooterChange}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          {[content1, content2, content3].map((val, idx) => (
            <div className="mb-3" key={idx}>
              <label className="form-label">{`Content ${idx + 1}`}</label>
              <input
                type="text"
                className="form-control"
                placeholder={`Content ${idx + 1}`}
                value={val}
                onChange={(e) => {
                  const setter = [setContent1, setContent2, setContent3][idx];
                  setter(e.target.value);
                }}
              />
            </div>
          ))}

          <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary">
            Guardar
          </button>
      </form>
    </>
  );
}

// 'use client';

// import React, { useRef,useState } from 'react';
// import { useSession } from 'next-auth/react';

// export default function EditorPDF() {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const { data: session } = useSession();
//   const [ enviado , setEnviado] = useState(false);

//   const sendEmail = async () => {
//     if (editorRef.current) {
//       setEnviado(true)
//       const htmlContent = editorRef.current.innerHTML;

//       const response = await fetch('/api/send-email', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           html: htmlContent,
//           email: 'leandroleonelrocha@gmail.com', // por si no hay sesión
//         }),
//       });

//       const result = await response.json();
//       console.log(result);
//       alert('Email enviado');
//       setEnviado(false)
//     }
//   };

//   return (
//     <>
//       <div className='row'>
        
//       <div className='col-12'>
//           <button
           
//             className="btn btn-primary float-end"
            
//           >
//            Abrir 
//           </button>
//         </div>

//         <div className='col-12'>
//           <button
//             onClick={sendEmail}
//             className="btn btn-primary float-end"
//             disabled={enviado}
//           >
//             {enviado ? 'Enviando...' : 'Enviar por email'}
//           </button>
//         </div>

//         <div ref={editorRef} style={{ padding: '20px', fontFamily: 'Arial' }}>
//           <div className="header">
//             <img src="/header.png" width="100%" />
//           </div>

//           <p style={{textAlign:'right', fontWeight: 'bold', fontSize: 16, color: 'black'}}>April 08, 2025</p>
//           <br></br>
//           <br></br>
//           <p style={{fontSize: 16, color: 'black'}}>Dear (Employee Name),</p>
//           <br></br>
//           <br></br>
//           <p style={{fontSize: 16, color: 'black'}}>We appreciate and value your contribution to Cotton’s achievements this year. In recognition of your hard work and performance, we are pleased to notify you that you have been awarded the following merit increase effective 01/01/2025.</p>
//           <br></br>
//           <br></br>
//           <div>
//             <table style={{ width: '100%',  border: '1px solid',}}>
//               <thead>
//                 <tr style={{ border: '1px solid', background: '#ffe598', textAlign: 'center'}}>
//                   <th style={{ padding: '10px',fontSize: 16, color: 'black' }}>2024 Base Salary</th>
//                   <th style={{ padding: '10px', fontSize: 16, color: 'black' }}>Salary Change (%)</th>
//                   <th style={{ padding: '10px', fontSize: 16, color: 'black'}}>2025 Base Salary</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr style={{ border: '1px solid', textAlign: 'center'}}>
              
//                   <td style={{ padding: '15px', fontSize: 16, color: 'black' }}>$ 111</td>
//                   <td style={{ padding: '15px',fontSize: 16, color: 'black' }}>% 4</td>
//                   <td style={{ padding: '15px',fontSize: 16, color: 'black' }}>$ 55</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//           <br></br>
//           <br></br>
//           <p style={{fontSize: 16, fontWeight: 'bold', color: 'black' }}>You will see this pay change reflected in your April 11, 2025, paycheck.</p>
//           <p style={{fontSize: 16,  marginBottom: '150px', color: 'black'}}>Thank you for your dedication and ongoing commitment to Cotton’s success! If you have any questions, please reach out to your manager for further assistance.</p>

//           <div className="footer" style={{ marginTop: '40px' }}>
//             <img src="/footer.png" width="100%" />
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }
