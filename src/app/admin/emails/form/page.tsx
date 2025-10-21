"use client"

import type React from "react"
import { useState } from "react"
import { apiRequest } from "@/server/services/core/apiRequest"
import * as Yup from "yup"
import { showSuccessAlert } from "@/hooks/alerts"

interface FormProps {
  id?: string
  onClose?: () => void
  onSuccess?: () => void
}

const Form: React.FC<FormProps> = ({ onClose, onSuccess }) => {
  const [headerImage, setHeaderImage] = useState<string | null>(null)
  const [footerImage, setFooterImage] = useState<string | null>(null)
  const [headerFile, setHeaderFile] = useState<File | null>(null)
  const [footerFile, setFooterFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [content1, setContent1] = useState("")
  const [content2, setContent2] = useState("")
  const [content3, setContent3] = useState("")
  const [content4, setContent4] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  const validationSchema = Yup.object({
    // title: Yup.string().required("El título es obligatorio"),
    // content1: Yup.string().required("Content 1 es obligatorio"),
    // content2: Yup.string().required("Content 2 es obligatorio"),
    // content3: Yup.string().required("Content 3 es obligatorio"),
    headerFile: Yup.mixed().required("* Required"),
    footerFile: Yup.mixed().required("* Required"),
  })

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
    if (submitting) return

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
      setSubmitting(false)
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

      await apiRequest(`templates/`, "POST", payload)

      if (onSuccess) {
        onSuccess()
      }

      if (onClose) {
        onClose()
      }

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
          <input
            type="file"
            className="form-control"
            onChange={handleHeaderChange}
            accept="image/*"
          />
          {errors.headerFile && <div className="text-danger">{errors.headerFile}</div>}
          {headerImage && (
            // show preview so headerImage is used
            <img src={headerImage} alt="Header preview" className="mt-2" style={{ maxWidth: "100%", height: "auto" }} />
          )}
        </div>

        <div className="mb-3">
          <label className="form-label">Footer</label>
          <input
            type="file"
            className="form-control"
            onChange={handleFooterChange}
            accept="image/*"
          />
          {errors.footerFile && <div className="text-danger">{errors.footerFile}</div>}
          {footerImage && (
            // show preview so footerImage is used
            <img src={footerImage} alt="Footer preview" className="mt-2" style={{ maxWidth: "100%", height: "auto" }} />
          )}
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

        <div className="mb-3">
          <label className="form-label">Content 4</label>
          <input
            type="text"
            className="form-control"
            placeholder="Content 4"
            value={content4}
            onChange={(e) => setContent4(e.target.value)}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : "Save"}
        </button>
      </form>
    </>
  )
}

export default function Page() {
  return <Form />
}