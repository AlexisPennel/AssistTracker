'use client'

import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useState } from 'react'

const UserParametersContext = createContext(null)

export const UserParametersProvider = ({ children }) => {
  const { status } = useSession()
  const [parameters, setParameters] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status !== 'authenticated') {
      setLoading(false)
      return
    }

    const fetchParameters = async () => {
      try {
        const res = await fetch('/api/user-parameters')
        const data = await res.json()
        setParameters(data)
      } catch (error) {
        console.error('Failed to load user parameters', error)
      } finally {
        setLoading(false)
      }
    }

    fetchParameters()
  }, [status])

  return (
    <UserParametersContext.Provider value={{ parameters, setParameters, loading }}>
      {children}
    </UserParametersContext.Provider>
  )
}

export const useUserParameters = () => {
  const context = useContext(UserParametersContext)
  if (!context) {
    throw new Error('useUserParameters must be used within UserParametersProvider')
  }
  return context
}
