import { createContext, useContext, useState } from 'react'

type ReorderContextType = {
  isReorder: boolean | 'cancel'
  setIsReorder: React.Dispatch<React.SetStateAction<boolean | 'cancel'>>
}

const ReorderContext = createContext<ReorderContextType | undefined>(undefined)

const ReorderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isReorder, setIsReorder] = useState(false)

  return (
    <ReorderContext.Provider value={{ isReorder, setIsReorder }}>
      {children}
    </ReorderContext.Provider>
  )
}

export default ReorderProvider

export const useReorderContext = () => {
  const context = useContext(ReorderContext)
  if (!context) {
    throw new Error('useReorderContext must be used within a ReorderProvider')
  }
  return context
}
