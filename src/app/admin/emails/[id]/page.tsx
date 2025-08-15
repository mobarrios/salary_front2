'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData';
import Link from 'next/link';
import ModalButton from '@/components/Modal/NewFormModal';

import Form from '../form/page';
import Breadcrumb from "@/components/BreadCrumb";
import { Title } from '@/components/Title';
import { useParams } from 'next/navigation';

export default function EditorPDF() {
  const editorRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const [showModal, setShowModal] = useState(false);
  const [modalSend, setModalSend] = useState(false);
  const { id } = useParams();

  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [reviews, setReviews] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const bc = [{ label: 'Review Cycle' }];

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileURL = URL.createObjectURL(e.target.files[0]);
      setHeaderImage(fileURL);
    }
  };

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileURL = URL.createObjectURL(e.target.files[0]);
      setFooterImage(fileURL);
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

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      <Breadcrumb items={bc} />
      <Title>Templates - Review </Title>

      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            <ModalButton
              type={false}
              itemId={1}
              name="New Template"
              FormComponent={Form}
              title="New Template"
            />
           </p>
        </div>

        <div className='col-12'>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Name</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">1</th>
                <td>Template 1</td>      
                <td className="text-end">
                  <ModalButton
                    type={true}
                    itemId={1}
                    name="Edit"
                    FormComponent={Form}
                    title={'Edit : '}
                  />
                  
                  
                  <Link href={`/admin/emails/employees/${id}/4`} className="btn btn-sm btn-primary float-end">
                    Employees
                  </Link>
                </td>
              </tr>
              <tr>
                <th scope="row">2</th>
                <td>Template 2</td>
                <td className="text-end">
                  <ModalButton
                    type={true}
                    itemId={1}
                    name="Edit"
                    FormComponent={Form}
                    title={'Edit : '}
                  />
                  <Link href={`/admin/emails/employees/${id}/5`} className="btn btn-sm btn-primary float-end">
                    Employees
                  </Link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    
    {showModal && (
      <div className="modal show d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Formulario de Email Template</h5>
              <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleSubmit}>
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

                <div className="mb-3">
                  <label className="form-label">Seleccionar Review</label>
                  <select
                    className="form-select"
                    value={selectedReview}
                    onChange={(e) => setSelectedReview(e.target.value)}
                  >
                    <option value="">Seleccione una opción</option>
                    {reviews.map((review) => (
                      <option key={review.id} value={review.id}>
                        {review.name}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary" onClick={handleSubmit}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

