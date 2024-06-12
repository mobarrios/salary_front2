"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react"
import Swal from 'sweetalert2'
import { apiRequest } from "@/server/services/core/apiRequest";

export default function RemoveItem({ id, url }: { id: number, url: string }) {
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

        const resp = await fetch(`http://127.0.0.1:8000/api/v1/${url}/delete/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${session?.user.token}`
            }
        });

        //const res = await apiRequest(`${url}/delete/${id}`, 'DELETE');
        return resp;
    };

    const handleDelete = async (id) => {
        try {
            const confirmed = await confirmDelete();

            if (confirmed) {
                const resp = await deleteRecord(id);
                router.refresh();

                if (resp.ok) {
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
        className="btn btn-danger m-1">
        Delete</button>;
}