'use client';

import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import {fetchData} from '@/server/services/core/fetchData'
import { Button, Form, Table } from 'react-bootstrap';
import Breadcrumb from "@/components/BreadCrumb";
import { Title } from '@/components/Title';

const FormEmployees: React.FC = () => {

  const bc = [{ label: 'People',url:'/admin/employees'},{ label: 'External data'}];

  const { data: session, status } = useSession()
  const [options, setOptions] = useState([]);
  const [actual, setActual] = useState();

  const [userTeams, setUserTeams] = useState();
  const { id } = useParams();
  const router = useRouter()


  const load = async () => {
    try {
      const jsonData = await fetchData(session?.user.token, 'GET', `employees/${id}`);  
      setOptions(jsonData.external_data)
      setActual(jsonData.actual_external_data)
    } catch (error) {
      console.error('Error fetching data:', error);
      return null;
    }
  };

  useEffect(() => {
    if (session?.user.token) {
  
      load();
     
    }

  }, [id, session?.user.token]);

  if (status === 'loading' || !options  || !actual  ) {
    return <p>Loading...</p>;
  }

  
  return (
    <div >
      <Breadcrumb items={bc}/>

      <div className='col-12'>
        <Title>External Data</Title>
      </div>
      <div className='col-12 mt-4'>
      <Form>
        <h5>Last updated data : </h5> <small>{actual['created_at']}</small>
        <div className='row mt-3'>
           <div className="col-3">
              <label className="form-label">Anual Salary</label>
              <input type="text" className="form-control"name="associate_id" value={actual['annual_salary']}/>
            </div>
          </div>

          <div className='row mt-3'>
           <div className="col-3">
              <label className="form-label">Associate Id</label>
              <input type="text" className="form-control"name="associate_id" value={actual['associate_id']}/>
            </div>
             <div className="col-3">
              <label className="form-label">Hire date</label>
              <input type="text" className="form-control"name="associate_id" value={actual['hire_data']}/>
            </div>
          </div>
          <div className='row mt-3'>
            <div className="col-3">
              <label className="form-label">Job title description</label>
              <input type="text" className="form-control"name="associate_id" value={actual['job_title_description']}/>
            </div>

            <div className="col-3">
              <label className="form-label">Job class description</label>
              <input type="text" className="form-control"name="associate_id" value={actual['job_title_description']}/>
            </div>

            <div className="col-3">
              <label className="form-label">Job Function description</label>
              <input type="text" className="form-control"name="associate_id" value={actual['job_function_description']}/>
            </div>
          </div>
          <div >
          <Button className="mt-3" type='submit'>Update</Button>
          </div>
      </Form>
      </div>
      <div className='col-12 table-responsive mt-4'>
        <div>
        <Table className='table table-striped'>
        <thead>
        <tr>
          <th className='text-uppercase'>Date</th>
          <th className='text-uppercase' >Asscociate ID</th>
          <th className='text-uppercase' >Name</th>
          <th className='text-uppercase'>hire_date</th>
          <th className='text-uppercase'>rehire_date</th>
          <th className='text-uppercase'>status</th>
          <th className='text-uppercase'>type</th>
          <th className='text-uppercase'>job_title_description</th>
          <th className='text-uppercase'>job_class_description</th>
          <th className='text-uppercase'>job_function_description</th>
          <th className='text-uppercase'>pay_grade_code</th>
          <th className='text-uppercase'>flsa_description</th>
          <th className='text-uppercase'>position_id</th>
          <th className='text-uppercase'>reports_to_legal_name</th>
          <th className='text-uppercase'>company_code</th>
          <th className='text-uppercase'>business_unit_code</th>
          <th className='text-uppercase'>location_description</th>
          <th className='text-uppercase'>department</th>
          <th className='text-uppercase'>home_department_description</th>
          <th className='text-uppercase'>pay_frequency</th>
          <th className='text-uppercase'>rate</th>
          <th className='text-uppercase'>regular_pay_effective_date</th>
          <th className='text-uppercase'>annual_salary</th>
          <th className='text-uppercase'>basis_of_pay</th>
          <th className='text-uppercase'>compensation_change_reason_description</th>
          <th className='text-uppercase'>basis_of_pay</th>
        </tr>
        </thead>
        <tbody>
        {options && options.map((option:any) => (
          <tr>
            <td>{option.created_at}</td>
            <td>{option.associate_id}</td>
            <td>{option.name}</td>
            <td>{option.hire_data}</td> 
            <td>{option.rehire_data}</td> 
            <td>{option.status}</td>
            <td>{option.type}</td> 
            <td>{option.job_title_description}</td>  
            <td>{option.job_class_description}</td>  
            <td>{option.job_function_description}</td> 
            <td>{option.pay_grade_code }</td>
            <td>{option.flsa_description }</td> 
            <td>{option.position_id }</td>
            <td>{option.reports_to_legal_name}</td>
            <td>{option.company_code}</td>
            <td>{option.business_unit_code}</td>
            <td>{option.location_code}</td>
            <td>{option.location_description}</td>
            <td>{option.department }</td>
            <td>{option.home_department_description}</td>
            <td>{option.pay_frequency }</td>
            <td>{option.rate}</td>
            <td>{option.regular_pay_effective_date}</td>
            <td>{option.annual_salary}</td> 
            <td>{option.basis_of_pay}</td>  
            <td>{option.compensation_change_reason_description }</td> 
          </tr>
        ))}
        </tbody>
        </Table>
        </div>
        
      </div>
    </div>

  );
};

export default FormEmployees;