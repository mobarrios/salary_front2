'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData';
import { apiRequest } from '@/server/services/core/apiRequest';
import { useRouter } from 'next/navigation'
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Form: React.FC = ({ id, onClose }) => {

  const { data: session } = useSession();

  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [headerFile, setHeaderFile] = useState<File | null>(null);
  const [footerFile, setFooterFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [content4, setContent4] = useState("");
  const [reviews, setReviews] = useState([]);
  

  const router = useRouter()
  
  const validationSchema = Yup.object({
    title: Yup.string().required("El título es obligatorio"),
    content1: Yup.string().required("Content 1 es obligatorio"),
    content2: Yup.string().required("Content 2 es obligatorio"),
    content3: Yup.string().required("Content 3 es obligatorio"),
  });



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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const fileUpload = async (file: File, field: "header" | "footer") => {
      const formData = new FormData();
      formData.append(field, file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Error al subir archivo");

      const data = await res.json();
      return data[field];
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
        content4,
        header: headerFileName,
        footer: footerFileName,
      };

      const response = await apiRequest(`templates/`, 'POST', payload)
      

      onClose();
      
      
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

          <button type="submit" className="btn btn-primary">
            Save
          </button>
      </form>
    </>
  );
}

export default Form;
