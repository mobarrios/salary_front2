'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData';
import Link from 'next/link';
import ModalButton from '@/components/Modal/NewFormModal';

//import Form from '../form/page';
import Form from '../form/page';
//import FormRatings from './form/page';

import Breadcrumb from "@/components/BreadCrumb";
import { Title } from '@/components/Title';
import { useParams } from 'next/navigation';
import RemoveItem from '@/components/Core/RemoveItem';

export default function EditorPDF() {
  
  const { data: session } = useSession();
  const [templates, setTemplates] = useState([]);
  const { id } = useParams();
  const bc = [{ label: 'Review Cycle' }];

  const load = async () => {
    if (!session?.user.token) return;
    try {
      // const res = await fetchData(session.user.token, 'GET', `reviews/all/?skip=0&limit=1000`);
      // if (res?.data) setReviews(res.data);

      const templatesResponse = await fetchData(session.user.token, 'GET', `templates/all/?skip=0&limit=1000`);
      if (templatesResponse?.data) setTemplates(templatesResponse.data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    load();
  }, [session?.user.token]);


  const handleDeleteLocal = () => {
    // Elimina el registro del estado local
    load();
  };

  return (
    <>
      <Breadcrumb items={bc} />
      <Title>Templates - Review </Title>

      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            <ModalButton
              type={false}
              itemId={id}
              name="New Template"
              FormComponent={Form} 
              //FormComponent={FormWithSaved} 
              title="New Template"
            />
           </p>
        </div>

        <div className='col-12'>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Title</th>
                <th scope="col">Footer</th>
                <th scope="col">Header</th>
              </tr>
            </thead>
            <tbody>
              {templates.map((template, index) => (
                <tr key={template.id}>
                  <th scope="row">{template.id}</th>
                  <td>{template.title }</td>  
                  <td>
                    {template.footer && (
                      <img
                        src={`/uploads/${template.footer}`}
                        alt="Footer"
                        style={{ width: "80px", height: "auto", objectFit: "cover" }}
                      />
                    )}
                  </td> 
                  <td>
                    {template.header && (
                      <img
                        src={`/uploads/${template.header}`}
                        alt="Header"
                        style={{ width: "80px", height: "auto", objectFit: "cover" }}
                      />
                    )}
                  </td>    
                  <td className="text-end">
                    <RemoveItem url={`templates`} id={template.id} onDelete={handleDeleteLocal} />
                    <Link href={`/admin/emails/employees/${id}/${template.id}`} className="btn btn-sm btn-primary float-end">
                      Employees
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

