'use client';
import { signOut, useSession } from "next-auth/react"
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useEffect, useState } from 'react';
import { Button } from "react-bootstrap";
import { redirect } from 'next/navigation'

const NavbarComp = () => {

  const [activePath, setActivePath] = useState('');

  const { data: session, status } = useSession()
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  }

  const isSuper = session?.user.roles.some(role => role.name === 'superuser');
  const isAdmin = session?.user.roles.some(role => role.name === 'administrator');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, []);

  return (
    <div>
      <Navbar expand="lg" className="bg-white shadow-sm navbar-fixed-top">
        <Container>
          <Navbar.Brand className="ms-auto" >
            <img
              src="/equipay.png"
              width="120"
              height="30"
              // className="d-inline-block align-top"
              alt="Logo"
            />
          {/* <h4 className="text-primary "><strong>$alary</strong></h4> */}
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav  " />
        <Navbar.Collapse id="basic-navbar-nav ">
          <Nav className="me-auto" defaultActiveKey="/admin/dashboard" >
            <Nav.Link href="/admin/dashboard" active={activePath === '/admin/dashboard'}>Home</Nav.Link>
            {/* <Nav.Link href="/admin/employees" active={activePath === '/admin/employees'}>People</Nav.Link> */}
            {/* <Nav.Link href="/admin/teams" active={activePath === '/admin/teams'}>Teams</Nav.Link> */}
            {/* <Nav.Link href="/admin/reviews" active={activePath === '/admin/reviews'}>Merit Cycle</Nav.Link> */}
            {/* <Nav.Link href="/admin/ratings" active={activePath === '/admin/ratings'}>Ratings</Nav.Link> */}

              {(isSuper || isAdmin) ? (
                <Nav.Link href="/admin/employees" active={activePath === '/admin/employees'}>People</Nav.Link>
              ) : (
                <Nav.Link href="/admin/teams" active={activePath === '/admin/teams'}>People</Nav.Link>
              )}

              <Nav.Link href="/admin/reviews" active={activePath === '/admin/reviews'}>Merit Cycle</Nav.Link>
              {isSuper || isAdmin && (
                <Nav.Link href="/admin/ratings" active={activePath === '/admin/ratings'}>Ratings</Nav.Link>
              )}

              {isSuper && (
                <NavDropdown title="Setting" id="basic-nav-dropdown" active={activePath === '/admin/users' || activePath === '/admin/roles'}>
                  <NavDropdown.Item href="/admin/users" active={activePath === '/admin/users'}>User management</NavDropdown.Item>
                  {/* <NavDropdown.Item href="/admin/roles" active={activePath === '/admin/roles'} >Roles</NavDropdown.Item> */}
                </NavDropdown>
              )}
            </Nav>
            <Nav >
              {/* <NavDropdown title={session?.user.name} id="basic-nav-dropdown">
              {/* <NavDropdown.Item href="/admin/users" >Profile</NavDropdown.Item> */}
              {/* <NavDropdown.Divider /> */}
              {/* <NavDropdown.Item href="#action/3.3"><a onClick={() => (handleLogout())} >Logout</a></NavDropdown.Item> */}
              {/* </NavDropdown> */}
              <Nav.Link href="#" onClick={() => (handleLogout())} >
                <Button className="btn btn-light">
                  <i className="bi bi-box-arrow-right m-2"></i>
                  log out
                </Button>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  )
}

export default NavbarComp;