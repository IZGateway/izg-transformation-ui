import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PreconditionsSection from '../preconditionsSection'

const mockSetHasPreconditions = jest.fn()

const mockPreconditions = [
  { id: 'field1', method: 'equals', value: 'value1' },
  { id: 'field2', method: 'exists', value: '' },
]

const mockPreconditionsData = {
  data: [
    { id: 'field1', fieldName: 'Field 1' },
    { id: 'field2', fieldName: 'Field 2' },
  ],
}

const mockPreconditionMethodsData = [
  { method: 'equals', fieldName: 'Equals' },
  { method: 'exists', fieldName: 'Exists' },
  { method: 'not_exists', fieldName: 'Not Exists' },
]

const mockSetPreconditions = jest.fn()

describe('PreconditionsSection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    render(
      <PreconditionsSection
        preconditions={mockPreconditions}
        setPreconditions={mockSetPreconditions}
        preconditionMethodsData={mockPreconditionMethodsData}
        preconditionsData={mockPreconditionsData}
        setHasPreconditions={mockSetHasPreconditions}
      />
    )
  })
  it('renders preconditions correctly', () => {
    expect(
      screen.getByTestId('precondition-form-control-Field-0')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('precondition-form-control-Conditional-0')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('precondition-form-control-value-0')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('delete-precondition-button-0')
    ).toBeInTheDocument()

    expect(
      screen.getByTestId('precondition-form-control-Field-1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('precondition-form-control-Conditional-1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('precondition-form-control-value-1')
    ).toBeInTheDocument()
    expect(
      screen.getByTestId('delete-precondition-button-1')
    ).toBeInTheDocument()
  })

  it('disables value input for exists and not_exists methods', () => {
    const valueInput1 = screen
      .getByTestId('precondition-form-control-value-0')
      .querySelector('input')
    const valueInput2 = screen
      .getByTestId('precondition-form-control-value-1')
      .querySelector('input')

    expect(valueInput1).not.toBeDisabled()
    expect(valueInput2).toBeDisabled()
  })

  it('calls setPreconditions when a field is changed', async () => {
    const valueInput = screen.getByRole('textbox', {
      name: 'Value',
    })
    fireEvent.change(valueInput, { target: { value: 'new value' } })

    expect(mockSetPreconditions).toHaveBeenCalled()
  })

  it('calls setPreconditions when delete button is clicked', () => {
    const deleteButton = screen.getByTestId('delete-precondition-button-0')
    fireEvent.click(deleteButton)

    expect(mockSetPreconditions).toHaveBeenCalled()
  })
})
