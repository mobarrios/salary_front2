import {apiRequest} from '@/server/services/core/apiRequest';
import { usePaginate } from "@/hooks/usePagination"
import { Params } from '@/types/params';
import TableComponent from '@/components/Core/TableComponent';

export default async function Dashboard({searchParams}: Params) {

 
  return (
    <div className="container">
        <h1>Dashboard</h1>
    </div>
  )};