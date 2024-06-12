import EditButton from "./EditButton";
import RemoveItem from "./RemoveItem";

const TableComponent = ({ data, model, headers }) => {
    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    {
                        headers.map((header, key: number) => (
                            <th scope="col">{header.name}</th>
                        ))
                    }
                </tr>
            </thead>
            <tbody>
                {data.map((item, rowIndex) => (
                    <tr>
                        {headers.map((header, colIndex) => (
                            <td>
                                {item[header.key]}
                            </td>

                        ))}
                        <td>
                            <EditButton url={model} id={item.id} />
                        </td>
                        <td>
                            <RemoveItem url={model} id={item.id} />
                        </td>

                    </tr>
                ))}
            </tbody>
        </table>
        
    );
}

export default TableComponent;