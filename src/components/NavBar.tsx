'use client';
import { signOut } from "next-auth/react"

const Navbar = () => {

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  }


  return (
    <nav className="navbar navbar-expand-lg shadow-sm navbar-dark bg-primary ">
      <div className="container-fluid ">
        <a className="navbar-brand" href="#"><h3>Salary</h3></a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="/admin/dashboard">
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/employees">Employees</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/items">Items</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="/admin/teams">Teams</a>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Administration
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="/admin/users">Users</a></li>
                <li><a className="dropdown-item" href="/admin/roles">Roles</a></li>
                <li><hr className="dropdown-divider" /></li>
                <li><a className="dropdown-item" href="#">Something else here</a></li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                <i className="bi bi-person-circle"></i>
              </a>
              <ul className="dropdown-menu">
                <li><a className="dropdown-item" href="#">Profile</a></li>
                <li><hr className="dropdown-divider" /></li>

                <li><button className="dropdown-item" onClick={() => handleLogout()}>Logout</button></li>
              </ul>
            </li>

          </ul>
          {/* <form className="d-flex" role="search">
              <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
              <button className="btn btn-success" type="submit">Search</button>
            </form> */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;