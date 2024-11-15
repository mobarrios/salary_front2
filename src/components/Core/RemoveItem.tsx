"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import Swal from 'sweetalert2'

export default function RemoveItem({ id, url,onDelete }: { id: number, url: string, onDelete: any }) {
    const router = useRouter();
    const { data: session } = useSession()

    const confirmDelete = async () => {
        const message = await Swal.fire({
            title: "Are you sure to delete this record?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!",
        });
        return message.isConfirmed;
    };

    const deleteRecord = async (id) => {

        const resp = await fetch(process.env.NEXT_PUBLIC_SALARY + `/${url}/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.user.token}`
            }
        });
        console.log(resp)
        return resp;
    };

    const handleDelete = async (id) => {
        try {
            const confirmed = await confirmDelete();

            if (confirmed) {
                const resp = await deleteRecord(id);
                router.refresh();

                if (resp.ok) {
                    onDelete()
                    Swal.fire({
                        title: "Delete!",
                        icon: "success"
                    });
                }
            }
        } catch (error) {
            console.log("error ===> ", error);
        }
    };

    return <button onClick={() => handleDelete(id)}
                    className="btn btn-light  m-1"><i className="text-danger bi bi-trash"></i></button>;
}