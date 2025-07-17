'use client';

import React, { useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { name } from '../roles/model';

// export default function EditorPDF() {
//   const editorRef = useRef<HTMLDivElement>(null);
//   const { data: session } = useSession();
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <>
//       {/* Botón para abrir modal */}
//       <button
//         onClick={() => setShowModal(true)}
//         className="btn btn-primary float-end"
//       >
//         Abrir
//       </button>

//        <div className="row ">
//             <div className="col-12">
//                 <div className="bg-white ">

//                     <form>
//                         <input name="title" className='form-control' />
//                           <input name="content1" className='form-control' />
//                             <input name="content2" className='form-control' />
//                         <button
//                             type="submit"
//                             className="btn btn-primary mt-3">
//                             Save
//                         </button>
//                     </form>

//                 </div>
//             </div>
//         </div>


//       {/* Modal */}
//       {showModal && (
//         <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
//           <div className="modal-dialog modal-lg" role="document">
//             <div className="modal-content">
              
//               <div className="modal-header">
//                 <h5 className="modal-title">Vista previa del contenido</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setShowModal(false)}
//                 ></button>
//               </div>

//               <div className="modal-body">
//                 {/* Tu contenido dentro del modal */}
//                 <div ref={editorRef} style={{ padding: '20px', fontFamily: 'Arial' }}>
//                   <div className="header">
//                     <img src="/header.png" width="100%" />
//                   </div>

//                   <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 16, color: 'black' }}>April 08, 2025</p>
//                   <p style={{ fontSize: 16, color: 'black', marginTop: '50px'}}>Dear (Employee Name),</p>
//                   <p style={{ fontSize: 16, color: 'black' }}>
//                     We appreciate and value your contribution to Cotton’s achievements this year. In recognition of your hard work and performance, we are pleased to notify you that you have been awarded the following merit increase effective 01/01/2025.
//                   </p>

//                   <div style={{ marginTop: '50px' }}>
//                     <table style={{ width: '100%', border: '1px solid' }}>
//                       <thead>
//                         <tr style={{ background: '#ffe598', textAlign: 'center' }}>
//                           <th style={{ padding: '10px' }}>2024 Base Salary</th>
//                           <th style={{ padding: '10px' }}>Salary Change (%)</th>
//                           <th style={{ padding: '10px' }}>2025 Base Salary</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         <tr style={{ textAlign: 'center' }}>
//                           <td style={{ padding: '15px' }}>$ 111</td>
//                           <td style={{ padding: '15px' }}>% 4</td>
//                           <td style={{ padding: '15px' }}>$ 55</td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <p style={{ fontSize: 16, fontWeight: 'bold', color: 'black', marginTop: '50px' }}>
//                     You will see this pay change reflected in your April 11, 2025, paycheck.
//                   </p>
//                   <p style={{ fontSize: 16, marginBottom: '150px', color: 'black' }}>
//                     Thank you for your dedication and ongoing commitment to Cotton’s success! If you have any questions, please reach out to your manager for further assistance.
//                   </p>

//                   <div className="footer" style={{ marginTop: '40px' }}>
//                     <img src="/footer.png" width="100%" />
//                   </div>
//                 </div>
//               </div>

//               <div className="modal-footer">
//                 <button
//                   type="button"
//                   className="btn btn-secondary"
//                   onClick={() => setShowModal(false)}
//                 >
//                   Cerrar
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// 'use client';

// import React, { useRef,useState } from 'react';
// import { useSession } from 'next-auth/react';

export default function EditorPDF() {
  const editorRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [ enviado , setEnviado] = useState(false);

  const sendEmail = async () => {
    if (editorRef.current) {
      setEnviado(true)
      const htmlContent = editorRef.current.innerHTML;

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          html: htmlContent,
          email: 'leandroleonelrocha@gmail.com', // por si no hay sesión
        }),
      });

      const result = await response.json();
      console.log(result);
      alert('Email enviado');
      setEnviado(false)
    }
  };

  return (
    <>
      <div className='row'>
        
      <div className='col-12'>
          <button
           
            className="btn btn-primary float-end"
            
          >
           Abrir 
          </button>
        </div>

        <div className='col-12'>
          <button
            onClick={sendEmail}
            className="btn btn-primary float-end"
            disabled={enviado}
          >
            {enviado ? 'Enviando...' : 'Enviar por email'}
          </button>
        </div>

        <div ref={editorRef} style={{ padding: '20px', fontFamily: 'Arial' }}>
          <div className="header">
            <img src="/header.png" width="100%" />
          </div>

          <p style={{textAlign:'right', fontWeight: 'bold', fontSize: 16, color: 'black'}}>April 08, 2025</p>
          <br></br>
          <br></br>
          <p style={{fontSize: 16, color: 'black'}}>Dear (Employee Name),</p>
          <br></br>
          <br></br>
          <p style={{fontSize: 16, color: 'black'}}>We appreciate and value your contribution to Cotton’s achievements this year. In recognition of your hard work and performance, we are pleased to notify you that you have been awarded the following merit increase effective 01/01/2025.</p>
          <br></br>
          <br></br>
          <div>
            <table style={{ width: '100%',  border: '1px solid',}}>
              <thead>
                <tr style={{ border: '1px solid', background: '#ffe598', textAlign: 'center'}}>
                  <th style={{ padding: '10px',fontSize: 16, color: 'black' }}>2024 Base Salary</th>
                  <th style={{ padding: '10px', fontSize: 16, color: 'black' }}>Salary Change (%)</th>
                  <th style={{ padding: '10px', fontSize: 16, color: 'black'}}>2025 Base Salary</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ border: '1px solid', textAlign: 'center'}}>
              
                  <td style={{ padding: '15px', fontSize: 16, color: 'black' }}>$ 111</td>
                  <td style={{ padding: '15px',fontSize: 16, color: 'black' }}>% 4</td>
                  <td style={{ padding: '15px',fontSize: 16, color: 'black' }}>$ 55</td>
                </tr>
              </tbody>
            </table>
          </div>
          <br></br>
          <br></br>
          <p style={{fontSize: 16, fontWeight: 'bold', color: 'black' }}>You will see this pay change reflected in your April 11, 2025, paycheck.</p>
          <p style={{fontSize: 16,  marginBottom: '150px', color: 'black'}}>Thank you for your dedication and ongoing commitment to Cotton’s success! If you have any questions, please reach out to your manager for further assistance.</p>

          <div className="footer" style={{ marginTop: '40px' }}>
            <img src="/footer.png" width="100%" />
          </div>
        </div>
      </div>
    </>
  );
}
