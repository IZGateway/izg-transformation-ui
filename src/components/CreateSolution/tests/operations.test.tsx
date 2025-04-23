import { render, screen, fireEvent } from '@testing-library/react'
import Operations from '../operations'
import '@testing-library/jest-dom'
import React from 'react'

describe('Operations Component', () => {
  const mockSetOperations = jest.fn()

  const operationTypeData = [{ method: 'copy' }, { method: 'set' }]

  const operationFieldsData = {
    data: [
      { id: 'field1', fieldName: 'Field 1' },
      { id: 'field2', fieldName: 'Field 2' },
    ],
  }

  const operations = [{ method: 'copy', sourceField: '', destinationField: '' }]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders with correct initial fields', () => {
    render(
      <Operations
        operations={operations}
        setOperations={mockSetOperations}
        operationTypeData={operationTypeData}
        operationFieldsData={operationFieldsData}
      />
    )

    expect(screen.getByLabelText('Operation Type')).toBeInTheDocument()
  })

  it('calls setOperations when operation type is changed', () => {
    render(
      <Operations
        operations={operations}
        setOperations={mockSetOperations}
        operationTypeData={operationTypeData}
        operationFieldsData={operationFieldsData}
      />
    )

    fireEvent.mouseDown(screen.getByLabelText('Operation Type'))
    fireEvent.click(screen.getByText('set'))

    expect(mockSetOperations).toHaveBeenCalled()
  })

  it('calls setOperations when a field value is changed', () => {
    render(
      <Operations
        operations={operations}
        setOperations={mockSetOperations}
        operationTypeData={operationTypeData}
        operationFieldsData={operationFieldsData}
      />
    )

    fireEvent.mouseDown(screen.getByLabelText('Operation Type'))
    fireEvent.click(screen.getByRole('option', { name: 'set' }))

    expect(mockSetOperations).toHaveBeenCalled()
  })

  it('calls setOperations when deleting', () => {
    jest.useFakeTimers()

    render(
      <Operations
        operations={operations}
        setOperations={mockSetOperations}
        operationTypeData={operationTypeData}
        operationFieldsData={operationFieldsData}
      />
    )

    fireEvent.click(screen.getByLabelText('delete'))
    jest.runAllTimers()

    expect(mockSetOperations).toHaveBeenCalled()
  })
})
