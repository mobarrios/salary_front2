import EditButton from "./EditButton";
import RemoveItem from "./RemoveItem";
import Link from "next/link";

const TableComponent = ({ data, model, headers, buttonExtra = [] }) => {
    return (
        <table className="table table-striped">
            <thead>
                <tr>
                    <th>#</th>
                    {headers.map((header, key) => (
                        <th scope="col" key={key}>{header.name}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.map((item, rowIndex) => (
                    <tr className="align-middle" key={item.id}>
                        <td>{item.id}</td>
                        {headers.map((header, colIndex) => (
                            <td key={header.key}>{item[header.key]}</td>
                        ))}
                        <td>
                            <EditButton url={model} id={item.id} />
                            <RemoveItem url={model} id={item.id} />
                            {buttonExtra && buttonExtra.map((campo, campoIndex) => (
                                <Link
                                    key={`${item.id}-${campoIndex}`}
                                    href={`/${campo.url}/${item.id}`}
                                    className="btn btn-warning m-1"
                                >
                                    {campo.name}
                                </Link>
                            ))}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

export default TableComponent;