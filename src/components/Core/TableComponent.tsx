import EditButton from "./EditButton";
import RemoveItem from "./RemoveItem";
import Link from "next/link";

const TableComponent = ({ data, model, headers, buttonExtra = [] }) => {
    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>#</th>
                    {
                        headers.map((header, key: number) => (
                            <th scope="col" key={key}>{header.name}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                 
                { 
                data ? (
                data.map((item, rowIndex) => (
                    <tr className="align-middle" key={rowIndex}>
                        <td>{item.id}</td>
                        {headers.map((header, colIndex) => (
                            <td>
                                {item[header.key]}
                            </td>

                        ))}
                        <td>
                            <EditButton url={model} id={item.id} />
                            <RemoveItem url={model} id={item.id} />
                            
                            {buttonExtra && buttonExtra.map((campo) => (
                                <Link
                                    key={item.id}
                                    href={`/${campo.url}/${item.id}`}
                                    className="btn btn-warning m-1"
                                >
                                    {campo.name}
                                </Link>
                            ))}

                        </td>

                    </tr>
                ))
                ):(
                    <tr>
                        <td colSpan={headers.length + 2}>No data available</td>
                     </tr>
                )
                }
            </tbody>
        </table>
        
    );
}

export default TableComponent;