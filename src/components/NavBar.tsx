'use client';
import { signOut, useSession } from "next-auth/react"
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';

const NavbarComp = () => {

  const { data: session, status } = useSession()
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  }


  return (
    <Navbar expand="lg" className="bg-body-tertiary shadow-sm">
      <Container>
        <Navbar.Brand href="#home">
        {/* <img
              src="/img/logo.svg"
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="React Bootstrap logo"
            /> */}
            <strong>S</strong>alary
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav  " />
        <Navbar.Collapse id="basic-navbar-nav ">
          <Nav className="me-auto " variant="underline" defaultActiveKey="/admin/dashboard" >
            <Nav.Link href="/admin/dashboard">Home</Nav.Link>
            <Nav.Link href="/admin/employees">Employees</Nav.Link>
            <Nav.Link href="/admin/teams">Teams</Nav.Link>

            <NavDropdown title="Administration" id="basic-nav-dropdown">
              <NavDropdown.Item href="/admin/users">Users</NavDropdown.Item>
              <NavDropdown.Item href="/admin/roles">Roles</NavDropdown.Item>
            </NavDropdown>
          </Nav>
           <Nav>
            <NavDropdown title="userName" id="basic-nav-dropdown">
              <NavDropdown.Item href="/admin/users">Profile</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item href="#action/3.3"><a onClick={()=>(handleLogout())} >Logout</a></NavDropdown.Item>
              </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

  ) 
}

export default NavbarComp;