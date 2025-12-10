"use client"

import React, { useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { fetchData } from "@/server/services/core/fetchData"
import { useParams } from "next/navigation"
import { Checkbox } from "primereact/checkbox"
import Breadcrumb from "@/components/BreadCrumb"
import { Title } from "@/components/Title"
import { formatSalary } from "@/functions/formEmployeeHandlers"
import { formatPrice } from "@/functions/formatDate"
import { apiRequest } from "@/server/services/core/apiRequest"
import { showErrorAlert, showSuccessAlert } from "@/hooks/alerts"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

/**
 * Types added to avoid implicit any and incorrect never[] typing
 */
type Template = {
  id?: number
  title?: string
  content1?: string
  content2?: string
  content3?: string
  header?: string
  footer?: string
}

type UserMinimal = {
  email?: string
}

type EmployeeMinimal = {
  id: number
  name?: string
  associate_id?: string | number
}

type Team = {
  id: number
  name?: string
  leader?: string
  code?: string
  employees?: EmployeeMinimal[]
  users?: UserMinimal[]
}

type EmployeeInfo = {
  id: number
  name?: string
  salary: number
  increment: number
  actualSalary: number
  email?: string
  percent?: string
}

export default function EditorPDF() {
  const editorRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const { reviews_id, templates_id } = useParams()

  const [showModal, setShowModal] = useState(false)

  // typed state
  const [team, setTeam] = useState<Team[]>([])
  const [employeeSelected, setEmployeeSelected] = useState<number | null>(null)
  const [employeeInfo, setEmployeeInfo] = useState<Record<number, EmployeeInfo>>({})
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([])
  const [template, setTemplate] = useState<Template | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)
  const [isBulkDownloading, setIsBulkDownloading] = useState(false)

  const bc = [{ label: "Review Cycle" }]

    useEffect(() => {
      const load = async () => {
        const token = session?.user?.token;
        if (!token) return;

        try {
          const rid = Array.isArray(reviews_id) ? reviews_id[0] : reviews_id ?? "";
          const tid = Array.isArray(templates_id) ? templates_id[0] : templates_id ?? "";

          /** ------------------------------
           * 1. TRAER TEMPLATE
           * ------------------------------ */
          const templateResponse = await fetchData(token, "GET", `templates/all/?skip=0&limit=1000`);
          const templateFiltered = templateResponse?.data?.find((t: any) => t.id == tid) ?? null;
          setTemplate(templateFiltered);

          /** ------------------------------
           * 2. TRAER TODOS LOS TEAMS
           * ------------------------------ */
          const teamsResponse = await fetchData(token, "GET", `teams/all/?skip=0&limit=1000`);
          const userEmail = (session?.user as any)?.email;

          /** ------------------------------
           * 3. TRAER LOS TEAMS DE LA REVIEW
           * ------------------------------ */
          const reviewTeamsResponse = await fetchData(
            token,
            "GET",
            `reviews_teams/all/?skip=0&limit=1000`
          );

          const reviewTeams = reviewTeamsResponse?.data?.filter(
            (item: any) => item.reviews_id === Number(rid)
          ) ?? [];

          const teamsIds = reviewTeams.map((item: any) => item.teams_id);

          /** ------------------------------
           * 4. FILTRAR EQUIPOS DONDE EL USUARIO ESTÁ
           * ------------------------------ */
          const filteredTeams = teamsResponse?.data?.filter((t: any) => {
            const isUserInTeam = t.users?.some((u: any) => u.email === userEmail);
            return isUserInTeam && teamsIds.includes(t.id);
          }) ?? [];

          setTeam(filteredTeams);

          /** ------------------------------
           * 5. ARMAR LISTA DE EMPLEADOS ÚNICOS POR TEAM
           * ------------------------------ */
          const employeeIds: number[] = [];

          filteredTeams.forEach((team: any) => {
            team.employees?.forEach((emp: any) => {
              if (!employeeIds.includes(emp.id)) {
                employeeIds.push(emp.id);
              }
            });
          });

          /** ------------------------------
           * 6. TRAER REVIEWS_teams_employees DE ESA REVIEW
           * ------------------------------ */
          const rteResponse = await fetchData(
            token,
            "GET",
            `reviews_teams_employees/all/?skip=0&limit=1000`
          );

          const filteredRTE = rteResponse?.data?.filter(
            (item: any) => item.reviews_id === Number(rid)
          ) ?? [];

         

          /** ------------------------------
           * 7. PROCESAR EMPLEADOS EN BATCHES
           * ------------------------------ */

          function chunk<T>(array: T[], size: number): T[][] {
            const result: T[][] = [];
            for (let i = 0; i < array.length; i += size) {
              result.push(array.slice(i, i + size));
            }
            return result;
          }

          const BATCH_SIZE = 20;
          const employeeChunks = chunk(employeeIds, BATCH_SIZE);

          let employeeArray: EmployeeInfo[] = [];

          for (const batch of employeeChunks) {
            const batchData = await Promise.all(
              batch.map(async (employeeId) => {
                const empResponse = await fetchData(token, "GET", `employees/${employeeId}`);
               
                if (!empResponse) return null;

                const email = empResponse?.actual_external_data?.email as string | undefined
                //const email = 'nicolas.monja@gmail.com'
                //const email = 'leandroleonelrocha@gmail.com'

                const review = filteredRTE.find((r: any) => r.employees_id === employeeId);
                const percent = review?.percent ?? 0;
                const salary = review?.annual_salary ?? 0;
                return {
                  id: employeeId,
                  name: empResponse?.name,
                  email: email,
                  salary,
                  increment: (salary * percent) / 100,
                  actualSalary: salary + (salary * percent) / 100,
                  percent: percent
                } as EmployeeInfo;
              })
            );

            employeeArray.push(...batchData.filter(Boolean) as EmployeeInfo[]);

            // evitar saturar backend
            await new Promise((res) => setTimeout(res, 120));
          }

       

          /** ------------------------------
           * 8. CONVERTIR A DICCIONARIO POR ID
           * ------------------------------ */
          const dict: Record<number, EmployeeInfo> = {};
          employeeArray.forEach((emp) => {
            dict[emp.id] = emp;
          });

          setEmployeeInfo(dict);

        } catch (error) {
          console.error("Error al cargar los datos:", error);
        }
      };

      load();
  }, [session?.user?.token, reviews_id, templates_id]);

  const handleSubmit = async () => {
    if (isSending) return
    setIsSending(true)
    setSentCount(0)

    const successes: number[] = []
    const failures: { id: number; error: string }[] = []

    try {
      for (const id of selectedEmployees) {
        try {
          const payload = { templates_id, reviews_id, employees_id: id }
          await apiRequest("templates/review_template/", "POST", payload)

          await sendEmailTo(id)
          setSentCount((n) => n + 1)
          successes.push(id)
        } catch (err: any) {
          console.error("sendEmailTo error for", id, err)
          failures.push({ id, error: err?.message || String(err) })
        }
      }
      
      if (failures.length === 0) {
        showSuccessAlert(`Emails sent: ${successes.length}/${selectedEmployees.length}`)
      } else if (successes.length > 0) {
        showErrorAlert(
          `Partial: ${successes.length} ok, ${failures.length} with error. ` +
            failures.slice(0, 5).map((f) => `ID ${f.id}: ${f.error}`).join(" | "),
        )
      } else {
        showErrorAlert(`All failed (${failures.length}). Ej: ${failures[0].id}: ${failures[0].error}`)
      }
    } finally {
      setIsSending(false)
    }
  }

  async function sendEmailTo(employeeId: number) {
    const emp = employeeInfo[employeeId]
    if (!emp) throw new Error("Employee not found")

    const html = generateEmailHTML(emp)
    const res = await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html,
        email: emp.email,
        subject: "Important: 2026 Merit Increase Details Enclosed",
        attachments: { header: template?.header, footer: template?.footer },
      }),
    })

    const text = await res.text()
    let data: any = {}
    try {
      data = JSON.parse(text)
    } catch {
      /* not json */
    }

    if (!res.ok) {
      const msg = data?.error || text || `HTTP ${res.status}`
      throw new Error(msg)
    }

    return data
  }

  const generateEmailHTML = (employee: EmployeeInfo) => {
    
      const tpl = template ?? ({} as Template)
      return `
        <div style="padding: 20px; font-family: Arial;">
          <div class="header">
            <img src="__HEADER_CID__" style="width:100%" />
          </div>
  
          <p style="text-align: right; font-weight: bold; font-size: 16px; color: black;">
            ${new Date().toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "2-digit",
            })}
          </p>
  
          <p style="font-size: 16px; color: black; margin-top: 50px;">
            ${tpl.title ?? ""} ${employee.name},
          </p>
  
          <p style="font-size: 16px; color: black;">
             ${tpl.content1 ?? ""}
          </p>
  
          <div style="margin-top: 50px;">
            <table style="width: 100%; border: 1px solid;">
              <thead>
                <tr style="background: #ffe598; text-align: center;">
                  <th style="padding: 10px;">2024 Base Salary</th>
                  <th style="padding: 10px;">Salary Change (%)</th>
                  <th style="padding: 10px;">2025 Base Salary</th>
                </tr>
              </thead>
              <tbody>
                <tr style="text-align: center;">
                  <td style="padding: 15px;">$ ${formatPrice(employee.salary)}</td>
                  <td style="padding: 15px;"> ${formatPrice(employee.percent)} %</td>
                  <td style="padding: 15px;">$ ${formatPrice(employee.actualSalary)}</td>
                </tr>
              </tbody>
            </table>
          </div>
  
          <p style="font-size: 16px; font-weight: bold; color: black; margin-top: 50px;">
           ${tpl.content2 ?? ""}
          </p>
  
          <p style="font-size: 16px; margin-bottom: 150px; color: black;">
            ${tpl.content3 ?? ""}
          </p>
  
          <div class="footer" style="margin-top: 40px;">
            <img src="__FOOTER_CID__" style="width:100%" />
          </div>
        </div>
      `
  }

  const createEmployeePdfBlob = async (employeeId: number | string) => {
    const id = typeof employeeId === "string" ? parseInt(employeeId, 10) : employeeId
    const employee = employeeInfo[id as number]
    if (!employee) throw new Error('Employee information not found')

    // === lo mismo que tu downloadPDF, pero retornando el Blob ===
    const tempDiv = document.createElement("div")
    tempDiv.innerHTML = generateEmailHTML(employee)
    tempDiv.style.position = "absolute"
    tempDiv.style.left = "-9999px"
    tempDiv.style.width = "800px"
    tempDiv.style.backgroundColor = "white"
    tempDiv.style.padding = "20px"

    const headerImg = tempDiv.querySelector('img[src="__HEADER_CID__"]') as HTMLImageElement | null
    const footerImg = tempDiv.querySelector('img[src="__FOOTER_CID__"]') as HTMLImageElement | null
    if (headerImg && template?.header) headerImg.setAttribute("src", `/uploads/${template.header}`)
    if (footerImg && template?.footer) footerImg.setAttribute("src", `/uploads/${template.footer}`)

    document.body.appendChild(tempDiv)

    const images = tempDiv.querySelectorAll("img")
    await Promise.all(
      Array.from(images).map((img) => new Promise<void>((resolve) => {
        if ((img as HTMLImageElement).complete) return resolve()
        img.onload = () => resolve()
        img.onerror = () => resolve()
      }))
    )

    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    document.body.removeChild(tempDiv)

    const pdf = new jsPDF("p", "mm", "a4")
    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight
    let position = 0

    pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

  const safeName = (employee.name ?? "employee").toString()
  const fileName = `salary_review_${safeName.replace(/\s+/g, "_")}_${new Date().getFullYear()}.pdf`
    const blob = pdf.output('blob') as Blob
    return { blob, fileName }
  }

  const handleBulkDownload = async () => {
    try {
      if (!selectedEmployees.length) {
        showErrorAlert("No hay empleados seleccionados")
        return
      }
      setIsBulkDownloading(true)

      const zip = new JSZip()
      // procesar secuencialmente para no explotar memoria/CPU
      for (const id of selectedEmployees) {
        try {
          const { blob, fileName } = await createEmployeePdfBlob(id)
          zip.file(fileName, blob)
          // ceder el hilo (mejora UX si son muchos)
          await new Promise(r => setTimeout(r, 0))
        } catch (e) {
          console.error('Error con empleado', id, e)
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })
      const stamp = new Date().toISOString().slice(0,10)
      saveAs(zipBlob, `salary_reviews_${stamp}_${selectedEmployees.length}employees.zip`)
      showSuccessAlert("Your work has been saved")
    } catch (err) {
      console.error(err)
      showErrorAlert("An error occurred while saving")
    } finally {
      setIsBulkDownloading(false)
    }
  }

  const handleCheckboxChange = (e: { checked?: boolean; target?: { checked?: boolean } }, employeeId: number) => {
    const checked = typeof e.checked === "boolean" ? e.checked : !!e.target?.checked
    if (checked) {
      setSelectedEmployees((prev) => (prev.includes(employeeId) ? prev : [...prev, employeeId]))
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => id !== employeeId))
    }
  }

  const handleTeamCheckboxChange = (
    e: { checked?: boolean; target?: { checked?: boolean } },
    employees?: EmployeeMinimal[],
  ) => {
    const checked = typeof e.checked === "boolean" ? e.checked : !!e.target?.checked
    const list = Array.isArray(employees) ? employees : []
    if (checked) {
      setSelectedEmployees((prev) => {
        const newIds = list.map((emp) => emp.id).filter((id) => !prev.includes(id))
        return [...prev, ...newIds]
      })
    } else {
      setSelectedEmployees((prev) => prev.filter((id) => !list.some((emp) => emp.id === id)))
    }
  }


  return (
    <>
      <Breadcrumb items={bc} />
      <Title>Templates - Review # {reviews_id}

      {selectedEmployees.length > 0 && (
        <button className='btn btn-primary ms-2 float-end' onClick={(e) => handleBulkDownload()}
        disabled={!selectedEmployees.length || isBulkDownloading}
        >
          <i className="bi bi-download"></i> {isBulkDownloading ? 'Downloading' : `Download PDF (${selectedEmployees.length})`}
        </button>
      )}
      </Title>

      <table className="table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Name</th>
            <th scope="col">Cod</th>
            <th scope="col">Base salary</th>
            <th scope="col">Increment</th>
            <th scope="col">Salary actual</th>
            <th scope="col">View</th>
            <th scope="col"></th>
            <th scope="col"></th>
          </tr>
        </thead>
        <tbody>
          {team.map((t, index) => (
            <React.Fragment key={t.id || index}>
                <tr className="table-light">
                <th scope="row">
                  <Checkbox
                    disabled={isSending}
                    onChange={(e) => handleTeamCheckboxChange(e, t.employees)}
                    checked={Array.isArray(t.employees) ? t.employees.every((emp) => selectedEmployees.includes(emp.id)) : false}
                  />
                </th>
                <td>{t.name}</td>
                <td>{t.leader}</td>
                <td>{t.code} </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>

              {Array.isArray(t.employees) &&
                t.employees.map((emp, i) => (
                  <>
                    <tr key={emp.id || i}>
                      <td>
                        <Checkbox
                            onChange={(e) => handleCheckboxChange(e, emp.id)}
                            checked={selectedEmployees.includes(emp.id)}
                          />
                      </td>
                      <td>{emp.name}</td>
                      <td>{emp.associate_id}</td>

                      <td>
                        {employeeInfo?.[emp.id]?.salary != null ? (
                          <>$ {formatPrice(employeeInfo[emp.id].salary)}</>
                        ) : (
                         <span className="spinner-border spinner-border-sm" role="status" aria-label="Cargando..." />
                        )}
                      </td>
                      <td>$ { formatPrice(employeeInfo[emp.id]?.increment)}</td>
                      <td>
                        {employeeInfo?.[emp.id]?.actualSalary != null ? (
                          <>$ {formatPrice(employeeInfo[emp.id].actualSalary)}</>
                        ) : (
                          <span className="spinner-border spinner-border-sm" role="status" aria-label="Cargando..." />
                        )}
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setEmployeeSelected(emp.id)
                            setShowModal(true)
                          }}
                          className="btn btn-outline-primary btn-sm"
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                      <td></td>
                    </tr>
                  </>
                ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Preview view</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body">
                {/* Tu contenido dentro del modal */}
                <div ref={editorRef} style={{ padding: "20px", fontFamily: "Arial" }}>
                  <div className="header">
                    {template ? (
                      <img
                        src={`/uploads/${template.header}`}
                        width="100%"
                        style={{
                          width: "100%", // ocupa todo el ancho del contenedor
                          height: "150px", // altura fija
                        }}
                      />
                    ) : (
                      <img src="/header.png" width="100%" />
                    )}
                  </div>

                  <p style={{ textAlign: "right", fontWeight: "bold", fontSize: 16, color: "black" }}>
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "2-digit",
                    })}
                  </p>
                  <p style={{ fontSize: 16, color: "black", marginTop: "50px" }}>
                    {template ? `${template.title} ${employeeSelected != null ? employeeInfo[employeeSelected]?.name ?? "" : ""} ` : ``} {" "}
                  </p>
                  <p style={{ fontSize: 16, color: "black" }}>
                    {template
                      ? `${template.content1}`
                      : `We appreciate and value your contribution to Cotton’s achievements this year. In recognition of your hard work and performance, we are pleased to notify you that you have been awarded the following merit increase effective 01/01/2025.`}
                  </p>

                  <div style={{ marginTop: "50px" }}>
                    <table style={{ width: "100%", border: "1px solid" }}>
                      <thead>
                        <tr style={{ background: "#ffe598", textAlign: "center" }}>
                          <th style={{ padding: "10px" }}>2024 Base Salary</th>
                          <th style={{ padding: "10px" }}>Salary Change (%)</th>
                          <th style={{ padding: "10px" }}>2025 Base Salary</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ textAlign: "center" }}>
                          <td style={{ padding: "15px" }}>$ {formatPrice(employeeSelected != null ? employeeInfo[employeeSelected]?.salary : 0)}</td>
                          <td style={{ padding: "15px" }}>
                            {formatPrice(employeeSelected != null ? employeeInfo[employeeSelected]?.increment : 0)} %
                          </td>
                          <td style={{ padding: "15px" }}>
                            $ {formatPrice(employeeSelected != null ? employeeInfo[employeeSelected]?.actualSalary : 0)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p style={{ fontSize: 16, fontWeight: "bold", color: "black", marginTop: "50px" }}>
                    {template
                      ? `${template.content2}`
                      : `You will see this pay change reflected in your April 11, 2025, paycheck.`}
                  </p>
                  <p style={{ fontSize: 16, marginBottom: "150px", color: "black" }}>
                    {template
                      ? `${template.content3}`
                      : `Thank you for your dedication and ongoing commitment to Cotton’s success! If you have any questions, please reach out to your manager for further assistance.`}
                  </p>

                  <div className="footer" style={{ marginTop: "40px" }}>
                    {template ? (
                      <img
                        src={`/uploads/${template.footer}`}
                        width="100%"
                        style={{
                          width: "100%", // ocupa todo el ancho del contenedor
                          height: "150px", // altura fija
                        }}
                      />
                    ) : (
                      <img src="/header.png" width="100%" />
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Closed
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-body">
          <div className="d-grid gap-2 col-6 mx-auto">
            <p className="text-center">
              <i className="bi bi-envelope"></i>
              <strong> {selectedEmployees.length} </strong> Employees selected for shipment
            </p>
            <button className="btn btn-primary" type="button" onClick={handleSubmit} disabled={isSending}>
              {isSending ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Sending {sentCount}/{selectedEmployees.length}...
                </>
              ) : (
                "Send emails"
              )}
            </button>
          </div>
        </div>
      </div>

    </>
  )
}
