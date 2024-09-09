

export const BreadCrumb = (active:string) => {
    return (
    <ol className="breadcrumb">
      <li className="breadcrumb-item"><a href="/admin/dashboard">Home</a></li>
      <li className="breadcrumb-item active" aria-current="page">{active}</li>
    </ol>
    )
}