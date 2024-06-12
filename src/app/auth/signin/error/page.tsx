'use client'
import { useEffect } from 'react'
import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'

const Page = () => {
  const { status } = useSession()

  useEffect(() => {
    status === 'authenticated' && redirect('/')
  }, [status])

  return
}

export default Page
