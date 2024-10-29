'use client'
import { useState, useEffect } from 'react';
import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import Pagination from '@/components/Pagination/Pagination';
import { headers, name } from './model';
import FormReview from './form/page';
import ReviewTeam from './teams/page';
import { getServerSession } from 'next-auth'
import { authOptions } from '@/server/auth'
import ModalButton from '@/components/Modal/NewFormModal';
import RemoveItem from '@/components/Core/RemoveItem';
import { Title } from '@/components/Title';
import { formatDate, formatPrice } from '../../../functions/formatDate';
import Breadcrumb from "@/components/BreadCrumb";
import { CheckboxComponent } from '@/components/CheckboxComponent';
import { fetchData } from '@/server/services/core/fetchData';
import { useSession } from 'next-auth/react';
import * as XLSX from 'xlsx';

export default function Employees({ searchParams }: Params) {

  const { page, search, limit, skip } = usePaginate(searchParams)
  const bc = [{ label: 'Review Cycle' }];

  const { data: session } = useSession()
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [checkedIds, setCheckedIds] = useState([]); // Array para guardar IDs seleccionados
  const [selectedData, setSelectedData] = useState([]);

  const isAdmin = session?.user.roles.some(role => role.name === 'superuser' || role.name === 'administrator');

  // Manejo de checkbox para agregar/eliminar IDs
  const handleCheckboxChange = (data) => {
    if (data.checked) {
      setSelectedData(prevData => [...prevData, { id: data.id, name: data.name }]);
    } else {
      setSelectedData(prevData => prevData.filter(item => item.id !== data.id));
    }
  };

  const handleDownload = () => {
    // Filtrar los datos para asegurarse de que no haya elementos vacíos
    const filteredData = results.filter(item => item.id && item.name);

    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Seleccionados");
    XLSX.writeFile(wb, "checkbox_seleccionados.xlsx");
  };

  useEffect(() => {
    const load = async () => {
      if (session?.user.token) {
        try {
          const res = await fetchData(session?.user.token, 'GET', `${name}/all/?skip=${(page - 1) * limit}&limit}`);
          console.log(res)
          if (res && res.data) {
            setResults(res.data); // Establece los resultados
            setTotalCount(res.count); // Establece el total de conteo
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
  }, [page, limit, session?.user.token]);
  //console.log(checkedIds)

  const totalPages = Math.ceil(totalCount / limit);


  return (
    <div>
      <Breadcrumb items={bc} />

      <Title>Review Cycle</Title>
      <div className="row mt-5">
        <div className='col-12'>
          <p className='float-start'>
            {isAdmin && (
              <>
                <ModalButton
                  type={false}
                  itemId={1}
                  name="New Merit Cycle"
                  FormComponent={FormReview}
                  title="New Merit Cycle"
                />
                {selectedData.length > 0 && (
                  <button className='btn btn-primary ms-2' onClick={(e) => handleDownload(e)}>Download excel</button>
                )}
              </>
            )}
          </p>

        </div>
        <div className='col-12 mt-3'>

          <table className="table table-hover">
            <thead>
              <tr>
                <th>#</th>
                {headers.map((header, key) => (
                  <th scope="col" key={key}>{header.name}</th>
                ))}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {
                results ? (
                  results.map((item, rowIndex) => (
                    <tr className="align-middle" key={rowIndex}>
                      <td>{item.id}</td>
                      <td>{item.name}</td>
                      <td>{formatPrice(item.price)}</td>
                      <td>{item.status === 1 ? 'Active' : 'Clossed'}</td>
                      <td>
                        {formatDate(item.form)} - {formatDate(item.to)}
                      </td>
                      <td className="text-end">
                        <ModalButton
                          type={true}
                          itemId={item.id}
                          name="Budgets"
                          FormComponent={ReviewTeam}
                          title={"Budgets for  " + item.name}
                        />
                        {isAdmin && (<>
                          <ModalButton
                            type={true}
                            itemId={item.id}
                            name="Edit"
                            FormComponent={FormReview}
                            title={'Edit : ' + item.name}
                          />
                          <RemoveItem
                            url={name}
                            id={item.id}
                          />
                        </>)}
                      </td>
                      <td>
                        <CheckboxComponent
                          id={item.id}
                          name={item.name}
                          onCheckboxChange={handleCheckboxChange}
                        />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={headers.length + 2}>No data available</td>
                  </tr>
                )
              }
            </tbody>
          </table>
        </div>
        {/* <div className='col-12 mt-3'>
          <Pagination page={page} totalPages={totalPages} />
        </div> */}
      </div>
    </div>
  )
};
