"use client"

import type React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { apiRequest } from "@/server/services/core/apiRequest"
import { useRouter } from "next/navigation"
import * as Yup from "yup"
import { showSuccessAlert } from "@/hooks/alerts"

const Form: React.FC = ({ id, onClose, onSuccess }) => {
  const { data: session } = useSession()

  const [headerImage, setHeaderImage] = useState<string | null>(null)
  const [footerImage, setFooterImage] = useState<string | null>(null)
  const [headerFile, setHeaderFile] = useState<File | null>(null)
  const [footerFile, setFooterFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [content1, setContent1] = useState("")
  const [content2, setContent2] = useState("")
  const [content3, setContent3] = useState("")
  const [content4, setContent4] = useState("")
  const [reviews, setReviews] = useState([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const router = useRouter()

  const validationSchema = Yup.object({
    // title: Yup.string().required("El título es obligatorio"),
    // content1: Yup.string().required("Content 1 es obligatorio"),
    // content2: Yup.string().required("Content 2 es obligatorio"),
    // content3: Yup.string().required("Content 3 es obligatorio"),
    headerFile: Yup.mixed().required("* Required"),
    footerFile: Yup.mixed().required("* Required"),
  })

  console.log("Form")
  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setHeaderFile(file)
      setHeaderImage(URL.createObjectURL(file))
      if (errors.headerFile) {
        setErrors((prev) => ({ ...prev, headerFile: "" }))
      }
    }
  }

  const handleFooterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFooterFile(file)
      setFooterImage(URL.createObjectURL(file))
      if (errors.footerFile) {
        setErrors((prev) => ({ ...prev, footerFile: "" }))
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (submitting) return; 

    setSubmitting(true)

    const formData = {
      title,
      content1,
      content2,
      content3,
      headerFile,
      footerFile,
    }

    try {
      await validationSchema.validate(formData, { abortEarly: false })
      setErrors({}) // Clear any previous errors
    } catch (validationErrors: any) {
      const errorMessages: Record<string, string> = {}
      if (validationErrors.inner) {
        validationErrors.inner.forEach((error: any) => {
          if (error.path) {
            errorMessages[error.path] = error.message
          }
        })
      }
      setErrors(errorMessages)
      return // Stop submission if validation fails
    }

    const fileUpload = async (file: File, field: "header" | "footer") => {
      const formData = new FormData()
      formData.append(field, file)

      const res = await fetch("/api/upload", { method: "POST", body: formData })
      if (!res.ok) throw new Error("Error al subir archivo")

      const data = await res.json()
      return data[field]
    }

    try {
      // 1. Subir archivos
      let headerFileName = null
      let footerFileName = null

      if (headerFile) {
        headerFileName = await fileUpload(headerFile, "header")
      }

      if (footerFile) {
        footerFileName = await fileUpload(footerFile, "footer")
      }

      // 2. Enviar todo al backend
      const payload = {
        title,
        content1,
        content2,
        content3,
        content4,
        header: headerFileName,
        footer: footerFileName,
      }

      const t = await apiRequest(`templates/`, "POST", payload)
      console.log(payload)

      if (onSuccess) {
        onSuccess()
      }

      onClose()
      showSuccessAlert("Your work has been saved")
    } catch (err) {
      console.error("Error al enviar formulario:", err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="mb-3">
          <label className="form-label">Header</label>
          {/* <input type="file" className="form-control" onChange={handleHeaderChange} /> */}
          <input
            type="file"
            className="form-control"
            onChange={handleHeaderChange}
            accept="image/*"
          />
          {errors.headerFile && <div className='text-danger'>{errors.headerFile}</div>}
        </div>
        <div className="mb-3">
          <label className="form-label">Footer</label>
          <input 
            type="file" 
            className="form-control" 
            onChange={handleFooterChange} 
          />
          {errors.footerFile && <div className='text-danger'>{errors.footerFile}</div>}
        </div>

        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            type="text"
            className="form-control"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {[content1, content2, content3].map((val, idx) => (
          <div className="mb-3" key={idx}>
            <label className="form-label">{`Content ${idx + 1}`}</label>
            <input
              type="text"
              className="form-control"
              placeholder={`Content ${idx + 1}`}
              value={val}
              onChange={(e) => {
                const setter = [setContent1, setContent2, setContent3][idx]
                setter(e.target.value)
              }}
            />
          </div>
        ))}

        <button type="submit" className="btn btn-primary">
          Save
        </button>

        {/* <button type="submit" className="btn btn-primary">
          {submitting && (
            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
          )}
          {submitting ? "Saving..." : "Save"}
        </button> */}

      </form>
    </>
  )
}

export default Form