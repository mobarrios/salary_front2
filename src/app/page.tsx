'use client';

import SignIn from "./auth/signin/page";
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'


export default function Home() {

  const { data: session } = useSession()

  if (session) {
    redirect('/admin/dashboard')
  }

  if (!session) {
    return (
      <>
        Not signed in <br />
        <SignIn searchParams={{
          error: undefined
        }} />
      </>
    )
  }

}
