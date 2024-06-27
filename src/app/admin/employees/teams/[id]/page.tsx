import { apiRequest } from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';


export default async function Employees({ searchParams }: Params) {


  return (
    <div className="row">
      <div className='col-12'>
           <h1 className='text-primary'>Employees</h1>
      </div>
     
    </div>
  )
};