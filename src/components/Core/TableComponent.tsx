import EditButton from "./EditButton";
import RemoveItem from "./RemoveItem";

const TableComponent = ({ data, model, headers }) => {
    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>#</th>
                    {
                        headers.map((header, key: number) => (
                            <th scope="col">{header.name}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {data.map((item, rowIndex) => (
                    <tr className="align-middle">
                        <td>{item.id}</td>
                        {headers.map((header, colIndex) => (
                            <td>
                                {item[header.key]}
                            </td>

                        ))}
                        <td>
                            <EditButton url={model} id={item.id} data={item} />
                            <RemoveItem url={model} id={item.id} />
                        </td>

                    </tr>
                ))}
            </tbody>
        </table>
        
    );
}

export default TableComponent;