import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SolutionInfo from '../solutionInfo'

describe('SolutionInfo Component', () => {
  const mockSetSolutionData = jest.fn()

  const mockData = {
    id: '1234-uuid',
    solutionName: 'Test Solution',
    version: '1.0',
    description: 'This is a description',
    active: true,
  }

  beforeEach(() => {
    mockSetSolutionData.mockClear()
  })

  it('renders all fields correctly', () => {
    render(
      <SolutionInfo
        solutionData={mockData}
        setSolutionData={mockSetSolutionData}
      />
    )

    expect(screen.getAllByText('Solution Info').length).toBeGreaterThan(0)
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveValue(
      'Test Solution'
    )
    expect(screen.getByRole('textbox', { name: 'Version' })).toHaveValue('1.0')
    expect(screen.getByRole('textbox', { name: 'Description' })).toHaveValue(
      'This is a description'
    )
    expect(screen.getByLabelText('True')).toBeChecked()
  })

  it('calls setSolutionData on name change', () => {
    render(
      <SolutionInfo
        solutionData={mockData}
        setSolutionData={mockSetSolutionData}
      />
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Name' }), {
      target: { value: 'Updated Name' },
    })

    expect(mockSetSolutionData).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls setSolutionData on version change', () => {
    render(
      <SolutionInfo
        solutionData={mockData}
        setSolutionData={mockSetSolutionData}
      />
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Version' }), {
      target: { value: '2.0' },
    })

    expect(mockSetSolutionData).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls setSolutionData on description change', () => {
    render(
      <SolutionInfo
        solutionData={mockData}
        setSolutionData={mockSetSolutionData}
      />
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Description' }), {
      target: { value: 'New description' },
    })

    expect(mockSetSolutionData).toHaveBeenCalledWith(expect.any(Function))
  })

  it('toggles the switch and updates active state', () => {
    render(
      <SolutionInfo
        solutionData={mockData}
        setSolutionData={mockSetSolutionData}
      />
    )

    const toggle = screen.getByRole('checkbox')
    fireEvent.click(toggle)

    expect(mockSetSolutionData).toHaveBeenCalledWith(expect.any(Function))
  })
})
