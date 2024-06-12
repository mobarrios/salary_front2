import Link from "next/link";

const EditButton = ({ url, id }) => {

    return (

        <Link
            href={`/admin/${url}/form/${id}`}
            className="btn btn-warning">
            Edit
        </Link>


    )
}

export default EditButton;