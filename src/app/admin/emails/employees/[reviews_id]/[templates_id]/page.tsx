'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { fetchData } from '@/server/services/core/fetchData';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Checkbox } from "primereact/checkbox";
import Breadcrumb from "@/components/BreadCrumb";
import { Title } from '@/components/Title';
import { formatSalary } from '@/functions/formEmployeeHandlers';
import { formatPrice } from '@/functions/formatDate';
import { name } from '../../../../reviews/model';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { apiRequest } from '@/server/services/core/apiRequest';
import { showSuccessAlert } from '@/hooks/alerts';

export default function EditorPDF() {
  const editorRef = useRef<HTMLDivElement>(null);
  const { data: session } = useSession();
  const { reviews_id, templates_id } = useParams();

  const [showModal, setShowModal] = useState(false);
  const [modalSend, setModalSend] = useState(false);

  const [review, setReview] = useState([]);
  const [selectedReview, setSelectedReview] = useState("");
  const [team, setTeam] = useState([]);
  const [employeeSelected, setEmployeeSelected] = useState();
  const [employeeInfo, setEmployeeInfo] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [headerImage, setHeaderImage] = useState<string | null>(null);
  const [footerImage, setFooterImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [content1, setContent1] = useState("");
  const [content2, setContent2] = useState("");
  const [content3, setContent3] = useState("");
  const [reviews, setReviews] = useState([]);
  const [ratingsTeamEmployees, setRatingsTeamEmployees] = useState([]);
  const [template, setTemplate] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const bc = [{ label: 'Review Cycle' }];

  useEffect(() => {
    const load = async () => {
      if (session?.user.token) {
        try {
          
          //search by template
          const templateResponse = await fetchData(session?.user.token, 'GET', `templates/all/?skip=0&limit=1000`);
          let templateFiltered = templateResponse.data.filter(item => item.id == templates_id);
          
          setTemplate(templateFiltered[0])
          
          const reviewTeamEmployeesResponse = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=1000`);
          // filter rating y employees
          const filterRatingEmployees = reviewTeamEmployeesResponse.data.filter(item => item.reviews_id == reviews_id);
          
          setRatingsTeamEmployees(filterRatingEmployees);
          
          const res =  await fetchData(session?.user.token, 'GET', `reviews/${reviews_id}`);
          setReview(res)
          
          const teamsData = await fetchData(session?.user.token, 'GET', `teams/all/?skip=0&limit=1000`);
          const userIdToFilter = session?.user.email;

          const reviewTeamsResponse = await fetchData(session?.user.token, 'GET', `reviews_teams/all/?skip=0&limit=1000`);
          const employeesWithIdOne = reviewTeamsResponse.data.filter(item => item.reviews_id === parseInt(reviews_id));

          const teams = [...new Set(employeesWithIdOne.map(item => (item.teams_id)))];
         
          const teamUserFilter = teamsData.data.filter(grupo =>
            grupo.users.some(user => user.email === userIdToFilter)
          );
          
          const employeeIds: any[] = [];

          const filteredTeams = teamUserFilter.filter(team => teams.includes(team.id));
          setTeam(filteredTeams)
          console.log(filteredTeams)
          filteredTeams.forEach(team => {
            if (Array.isArray(team.employees)) {
              team.employees.forEach(employee => {
                if (!employeeIds.includes(employee.id)) {
                  employeeIds.push(employee.id);
                }
              });
            }
          });
         
          const employeeData = await Promise.all(
            employeeIds.map(async employeeId => {
            
              const data = await fetchData(session?.user.token, 'GET', `employees/${employeeId}`);

              if (!data) {
                console.error(`Error fetching employee ${employeeId}:`, res.statusText);
                return null;
              }

              //const data = await res.json();
              let salary = formatSalary(data.actual_external_data.annual_salary)
              
              const reviewsTeamsEmployees = await fetchData(session?.user.token, 'GET', `reviews_teams_employees/all/?skip=0&limit=1000`);
            
              const filteredReviewsTeamsEmployees = reviewsTeamsEmployees.data.filter(item => item.reviews_id == reviews_id && item.employees_id == employeeId);
              //console.log('filteredReviewsTeamsEmployees', filteredReviewsTeamsEmployees[0])
              let percent = filteredReviewsTeamsEmployees[0] ? filteredReviewsTeamsEmployees[0].percent : 0;
              let increment = (salary * percent) / 100;
              let actualSalary = salary + increment

              return {
                id: employeeId,
                salary: salary,
                increment: percent,
                actualSalary: actualSalary,
                email: 'leandroleonelrocha@gmail.com',
                //email: 'nicolas.monja@gmail.com',
                name: data.name
              };
            })
          );
         
          // Filtramos nulos
          const validEmployees = employeeData.filter(emp => emp !== null);

          const employeeMap = Object.fromEntries(
            validEmployees.map(emp => [emp.id, emp])
          );

          // Guardamos en el estado
          setEmployeeInfo(employeeMap);

        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      }
    };
    load();
  }, [session?.user.token]);

  const handleCheckboxChange = (e, employeeId: number) => {
    if (e.checked) {
      // Agregar el ID si está marcado
      setSelectedEmployees((prev) => [...prev, employeeId]);
     
    } else {
      // Quitar el ID si se desmarca
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId));
    }
   
  };
  
  const handleTeamCheckboxChange = (e, employees: { id: number }[]) => {
    if (e.target.checked) {
      setSelectedEmployees((prev) => {
        const newIds = employees
          .map(emp => emp.id)
          .filter(id => !prev.includes(id)); // solo los no repetidos
        return [...prev, ...newIds];
      });
    } else {
      setSelectedEmployees((prev) => 
        prev.filter(id => !employees.some(emp => emp.id === id))
      );
    }
  };

  async function sendEmailTo(employeeId: string) {
    const html = generateEmailHTML(employeeInfo[employeeId]);
    const res = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        html,
        email: employeeInfo[employeeId].email,
        //email: 'leandroleonelrocha@gmail.com',
        subject: 'Prueba',
        attachments: {
          header: template.header, 
          footer: template.footer
        },
      }),
    });

    console.log('Res: ',res)
    const data = await res.json();

    if (res.ok) {
      //showSuccessAlert("Emails sent correctly");
      //console.log(`Email enviado a ${employee.name}`);
    } else {
      //console.error(`Error al enviar a ${employee.name}:`, data.error);
    }
  }

  const handleSubmit = async () => {
    
    if (isSending) return;           
    setIsSending(true);
    setSentCount(0);
   
    for (const id of selectedEmployees) {
      
      const payload = {
          templates_id: templates_id,
          reviews_id: reviews_id,
          employees_id: id
      };

      const response = await apiRequest(`templates/review_template/`, 'POST', payload)
      
      console.log('Review_template: ', response)
      await sendEmailTo(id);   
      setSentCount((n) => n + 1);
      
    }

    setIsSending(false);
    showSuccessAlert("Emails sent correctly");

  };


  const generateEmailHTML = (employee) => {
    return `
      <div style="padding: 20px; font-family: Arial;">
        <div class="header">
          <img src="__HEADER_CID__" style="width:100%" />
        </div>

        <p style="text-align: right; font-weight: bold; font-size: 16px; color: black;">
          ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: '2-digit',
          })}
        </p>

        <p style="font-size: 16px; color: black; margin-top: 50px;">
          ${template.title} (${employee.name}),
        </p>

        <p style="font-size: 16px; color: black;">
           ${template?.content1}
        </p>

        <div style="margin-top: 50px;">
          <table style="width: 100%; border: 1px solid;">
            <thead>
              <tr style="background: #ffe598; text-align: center;">
                <th style="padding: 10px;">2024 Base Salary</th>
                <th style="padding: 10px;">Salary Change (%)</th>
                <th style="padding: 10px;">2025 Base Salary</th>
              </tr>
            </thead>
            <tbody>
              <tr style="text-align: center;">
                <td style="padding: 15px;">$ ${formatPrice(employee.salary)}</td>
                <td style="padding: 15px;">% ${formatPrice(employee.increment)}</td>
                <td style="padding: 15px;">$ ${formatPrice(employee.actualSalary)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p style="font-size: 16px; font-weight: bold; color: black; margin-top: 50px;">
         ${template.content2}
        </p>

        <p style="font-size: 16px; margin-bottom: 150px; color: black;">
          ${template.content3}
        </p>

        <div class="footer" style="margin-top: 40px;">
          <img src="__FOOTER_CID__" style="width:100%" />
        </div>
      </div>
    `;
  };


  return (
    <>

    <Breadcrumb items={bc} />
    <Title>Templates - Review # {reviews_id}</Title>
    
      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Cod</th>
            <th scope="col">Base salary</th>
            <th scope="col">Increment</th>
            <th scope="col">Salary actual</th>
            <th scope="col">View</th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          
          {team.map((t, index) => (
            <React.Fragment key={t.id || index}>
              <tr className="table-light"> 
                <th scope="row">
                  <Checkbox 
                    disabled={isSending}   
                    onChange={(e) => handleTeamCheckboxChange(e, t.employees)} 
                    checked={t.employees.every(emp => selectedEmployees.includes(emp.id))}
                  />
                </th>
                <td>{t.name}</td>
                <td>{t.leader}</td>
                <td>{t.code} </td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              {Array.isArray(t.employees) && t.employees.map((emp, i) => (
              <tr key={emp.id || i}>
                <td>
                  <Checkbox 
                    onChange={(e) => handleCheckboxChange(e, emp.id)} 
                    checked={selectedEmployees.includes(emp.id)} 
                  />
                </td>
                <td>{emp.name}</td>
                <td>{emp.associate_id}</td>

                <td >
                  {employeeInfo?.[emp.id]?.salary != null ? (
                    <>$ {formatPrice(employeeInfo[emp.id].salary)}</>
                  ) : (
                    <span className="spinner-border spinner-border-sm" role="status" aria-label="Cargando..." />
                  )}
                </td>
                <td>{employeeInfo[emp.id]?.increment}</td>
                <td >
                  {employeeInfo?.[emp.id]?.actualSalary != null ? (
                    <>$ {formatPrice(employeeInfo[emp.id].actualSalary)}</>
                  ) : (
                    <span className="spinner-border spinner-border-sm" role="status" aria-label="Cargando..." />
                  )}
                </td>

                <td>
                  <button
                    type="button"
                    onClick={(e) => {
                      
                      e.preventDefault();
                      setEmployeeSelected(emp.id)
                      setShowModal(true);
                      
                    }}
                    className="btn btn-outline-primary btn-sm"
                    
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                </td>
                <td></td>
              </tr>
            ))}
            </React.Fragment>
          ))}
          
        </tbody>
      </table>

      {showModal && (
        <div className="modal fade show d-block" tabIndex={-1} role="dialog" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              
              <div className="modal-header">
                <h5 className="modal-title">Preview view</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <div className="modal-body">
                {/* Tu contenido dentro del modal */}
                <div ref={editorRef} style={{ padding: '20px', fontFamily: 'Arial' }}>
                  <div className="header">
                    {template ? <img 
                      //src={headerImage.header} 
                      src={`/uploads/${template.header}`}
                      width="100%" 
                      style={{
                        width: '100%',      // ocupa todo el ancho del contenedor
                        height: '150px',    // altura fija
                        //objectFit: 'contain', // mantiene proporción y muestra todo
                        //border: '1px solid #ccc',
                        //borderRadius: '8px',
                      }}  
                    /> : <img src="/header.png" width="100%" />}
                  </div>

                  <p style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 16, color: 'black' }}>
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: '2-digit'
                    })}
                  </p>
                  <p style={{ fontSize: 16, color: 'black', marginTop: '50px'}}>{template ? `${template.title} (${employeeInfo[employeeSelected]?.name }) ` : `` } </p>
                  <p style={{ fontSize: 16, color: 'black' }}>
                    { template ? `${template.content1}` : `We appreciate and value your contribution to Cotton’s achievements this year. In recognition of your hard work and performance, we are pleased to notify you that you have been awarded the following merit increase effective 01/01/2025.`}
                  </p>

                  <div style={{ marginTop: '50px' }}>
                    <table style={{ width: '100%', border: '1px solid' }}>
                      <thead>
                        <tr style={{ background: '#ffe598', textAlign: 'center' }}>
                          <th style={{ padding: '10px' }}>2024 Base Salary</th>
                          <th style={{ padding: '10px' }}>Salary Change (%)</th>
                          <th style={{ padding: '10px' }}>2025 Base Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ textAlign: 'center' }}>
                          <td style={{ padding: '15px' }}>$ { formatPrice(employeeInfo[employeeSelected]?.salary) }</td>
                          <td style={{ padding: '15px' }}>% { formatPrice(employeeInfo[employeeSelected]?.increment) }</td>
                          <td style={{ padding: '15px' }}>$ { formatPrice(employeeInfo[employeeSelected]?.actualSalary) }</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p style={{ fontSize: 16, fontWeight: 'bold', color: 'black', marginTop: '50px' }}>
                   { template ? `${template.content2}` : `You will see this pay change reflected in your April 11, 2025, paycheck.`}
                  </p>
                  <p style={{ fontSize: 16, marginBottom: '150px', color: 'black' }}>
                    { template ? `${template.content3}` : `Thank you for your dedication and ongoing commitment to Cotton’s success! If you have any questions, please reach out to your manager for further assistance.`}
                  </p>

                  <div className="footer" style={{ marginTop: '40px' }}>
                    {footerImage ?
                    <img 
                      //src={footerImage} 
                      src={`/uploads/${template.footer}`}
                      width="100%" 
                    /> 
                     : 
                     <img src="/footer.png" width="100%" />}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">

          <div className="d-grid gap-2 col-6 mx-auto">
            <p className='text-center' ><i className='bi bi-envelope'></i><strong> {selectedEmployees.length} </strong> Empleados seleccionados para envío</p>
            
            {/* <button className="btn btn-primary" disabled={selectedEmployees.length == 0} type="button" onClick={ () => handleSubmit() }> Enviar Emails</button> */}
            <button
              className="btn btn-primary"
              type="button"
              onClick={handleSubmit}
              disabled={isSending}
            >
              {isSending ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  />
                  Enviando {sentCount}/{selectedEmployees.length}...
                </>
              ) : (
                'Enviar Emails'
              )}
            </button>
          </div>
        </div>
      </div>
      

    </>
    
  );
}
