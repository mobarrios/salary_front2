'use client';
import { useParams } from 'next/navigation';
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSession } from "next-auth/react";
import { apiRequest } from '@/server/services/core/apiRequest';
import { fetchData } from '@/server/services/core/fetchData'
import { Button, Form, Table } from 'react-bootstrap';
import Breadcrumb from "@/components/BreadCrumb";
import { Title } from '@/components/Title';
import { showSuccessAlert, showErrorAlert } from '@/hooks/alerts';

const FormEmployees: React.FC = () => {
  const bc = [{ label: 'People', url: '/admin/employees' }, { label: 'External data' }];
  const { data: session, status } = useSession();
  const [options, setOptions] = useState([]);
  const [actual, setActual] = useState({});
  const [formData, setFormData] = useState({}); // Estado para los datos del formulario
  const { id } = useParams();
  const router = useRouter();
  const isValidator = session?.user.roles.some(role => role.name === 'approver');

  const load = async () => {
    try {
      const jsonData = await fetchData(session?.user.token, 'GET', `employees/${id}`);
      console.log(jsonData)
      setOptions(jsonData.external_data);
      setActual(jsonData.actual_external_data);
      setFormData(jsonData.actual_external_data); // Inicializa el formulario con los datos actuales
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

  if (status === 'loading' || !options || !actual) {
    return <p>Loading...</p>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    //console.log(formData, actual)
    try {
      const response = await apiRequest(`external_data/edit/${actual.id}`, 'PUT', formData);
      console.log(response)
      router.refresh();
      showSuccessAlert("Your work has been saved");
    } catch (error) {
      console.error('Error:', error);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <div>
      <Breadcrumb items={bc} />
      <div className='col-12'>
        <Title>Details</Title>
      </div>
      <div className='col-12 mt-4'>
        <Form>
          <h5>Last updated data : </h5> <small>{actual['created_at']}</small>
          <div className='row mt-3'>
            <div className="col-3">
              <label className="form-label">Annual Salary</label>
              <input type="text" className="form-control" name="annual_salary" value={formData['annual_salary'] || ''} onChange={handleChange} />
            </div>
          </div>
          <div className='row mt-3'>
            <div className="col-3">
              <label className="form-label">Associate Id</label>
              <input type="text" className="form-control" name="associate_id" value={formData['associate_id'] || ''} onChange={handleChange} />
            </div>
            <div className="col-3">
              <label className="form-label">Hire date</label>
              <input type="text" className="form-control" name="hire_date" value={formData['hire_date'] || ''} onChange={handleChange} />
            </div>
          </div>
          <div className='row mt-3'>
            <div className="col-3">
              <label className="form-label">Job title description</label>
              <input type="text" className="form-control" name="job_title_description" value={formData['job_title_description'] || ''} onChange={handleChange} />
            </div>
            <div className="col-3">
              <label className="form-label">Job class description</label>
              <input type="text" className="form-control" name="job_class_description" value={formData['job_class_description'] || ''} onChange={handleChange} />
            </div>
            <div className="col-3">
              <label className="form-label">Job Function description</label>
              <input type="text" className="form-control" name="job_function_description" value={formData['job_function_description'] || ''} onChange={handleChange} />
            </div>
          </div>
          <div>
            {!isValidator &&
              <Button className="mt-3" type='submit' onClick={handleSubmit}>Update</Button>
            }
          </div>
        </Form>
      </div>
      <div className='col-12 table-responsive mt-4'>
        <div>
          <Table className='table table-striped table-bordered'>
            <thead>
              <tr>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Date</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Associate ID</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Name</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Hire Date</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Rehire Date</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Status</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Type</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Job Title Description</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Job Class Description</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Job Function Description</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Pay Grade Code</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>FLSA Description</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Position ID</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Reports To Legal Name</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Company Code</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Business Unit Code</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Location Code</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Location Description</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Department</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Home Department Description</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Pay Frequency</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Rate</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Regular Pay Effective Date</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Annual Salary</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Basis of Pay</th>
                <th className='text-uppercase text-center' style={{ whiteSpace: 'nowrap' }}>Compensation Change Reason Description</th>
              </tr>
            </thead>
            <tbody>
              {options && options.map((option: any) => (
                <tr key={option.associate_id}>
                  <td>{option.created_at}</td>
                  <td>{option.associate_id}</td>
                  <td>{option.name}</td>
                  <td>{option.hire_date}</td>
                  <td>{option.rehire_date}</td>
                  <td>{option.status}</td>
                  <td>{option.type}</td>
                  <td>{option.job_title_description}</td>
                  <td>{option.job_class_description}</td>
                  <td>{option.job_function_description}</td>
                  <td>{option.pay_grade_code}</td>
                  <td>{option.flsa_description}</td>
                  <td>{option.position_id}</td>
                  <td>{option.reports_to_legal_name}</td>

                  <td>{option.company_code}</td>
                  <td>{option.business_unit_code}</td>
                  <td>{option.location_code}</td>
                  <td>{option.location_description}</td>
                  <td>{option.department}</td>
                  <td>{option.home_department_description}</td>
                  <td>{option.pay_frequency}</td>
                  <td>{option.rate}</td>
                  <td>{option.regular_pay_effective_date}</td>
                  <td>{option.annual_salary}</td>
                  <td>{option.basis_of_pay}</td>
                  <td>{option.compensation_change_reason_description}</td>
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