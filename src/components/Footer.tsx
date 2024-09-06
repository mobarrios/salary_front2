'use client';
import { signOut, useSession } from "next-auth/react"
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { useEffect, useState } from 'react';

const FooterComp = () => {

  const [activePath, setActivePath] = useState('');

  const { data: session, status } = useSession()
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setActivePath(window.location.pathname);
    }
  }, []);

  return (
    <Navbar expand="lg" className="bg-white  navbar-fixed-bottom">
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
        </Container>
    </Navbar>
    )
}

export default FooterComp;