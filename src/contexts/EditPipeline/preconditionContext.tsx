import React, { createContext, useContext } from 'react'

type PreconditionContextType = {
  preconditionsData: object | null
  preconditionMethodsData: object | null
}

const PreconditionContext = createContext<PreconditionContextType | undefined>(
  undefined
)

const PreconditionProvider = ({
                                children,
                                preconditionsData,
                                preconditionMethodsData,
                              }: {
  children: React.ReactNode
  preconditionsData: object | null
  preconditionMethodsData: object | null
}) => {
  return (
    <PreconditionContext.Provider
      value={{ preconditionsData, preconditionMethodsData }}
    >
      {children}
    </PreconditionContext.Provider>
  )
}
export default PreconditionProvider

export const usePreconditionContext = () => {
  const context = useContext(PreconditionContext)
  if (!context) {
    throw new Error(
      'usePreconditionContext must be used within a PreconditionProvider'
    )
  }
  return context
}
