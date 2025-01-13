'use client';

import SignIn from "./auth/signin/page";
import { redirect } from 'next/navigation'
// import { useSession } from 'next-auth/react'

import { useSession, signOut } from "next-auth/react";
import { useEffect } from "react";

export default function Home() {

   const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirigir manualmente al login
      window.location.href = "/auth/signin";
    }
  }, [status]);

  if (status === "loading") return <p>Loading...</p>;

   redirect('/admin/home')

  // return session ? <div>Welcome, {session.user.name}</div> : null;


  // const { data: session } = useSession()

  // if (session) {
  //   redirect('/admin/home')
  // }

  // if (!session) {
  //   return (
  //     <>
  //       Not signed in <br />
  //       <SignIn searchParams={{
  //         error: undefined
  //       }} />
  //     </>
  //   )
  // }

}
