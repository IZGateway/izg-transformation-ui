import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import MappingInfo from '../mappingInfo'

describe('MappingInfo Component', () => {
  const mockSetMappingData = jest.fn()

  const mockData = {
    id: 'abc-123',
    organizationName: 'Test Org',
    codeSystem: 'SNOMED-CT',
    code: 'J07BB02',
    targetCodeSystem: 'CVX',
    targetCode: '141',
    active: true,
  }

  beforeEach(() => {
    mockSetMappingData.mockClear()
  })

  it('renders all fields correctly', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )

    expect(screen.getByText('Mapping Info')).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: 'Source Code System' })).toHaveValue('SNOMED-CT')
    expect(screen.getByRole('textbox', { name: 'Source Code' })).toHaveValue('J07BB02')
    expect(screen.getByRole('textbox', { name: 'Target Code System' })).toHaveValue('CVX')
    expect(screen.getByRole('textbox', { name: 'Target Code' })).toHaveValue('141')
  })

  it('renders the ID field as disabled', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )
    const idField = screen.getByDisplayValue('abc-123')
    expect(idField).toBeDisabled()
  })

  it('calls setMappingData when Source Code System changes', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Source Code System' }), {
      target: { value: 'ICD-10' },
    })
    expect(mockSetMappingData).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls setMappingData when Source Code changes', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Source Code' }), {
      target: { value: 'NEW_CODE' },
    })
    expect(mockSetMappingData).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls setMappingData when Target Code System changes', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Target Code System' }), {
      target: { value: 'LOINC' },
    })
    expect(mockSetMappingData).toHaveBeenCalledWith(expect.any(Function))
  })

  it('calls setMappingData when Target Code changes', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Target Code' }), {
      target: { value: '999' },
    })
    expect(mockSetMappingData).toHaveBeenCalledWith(expect.any(Function))
  })

  it('shows Active toggle as checked when active is true', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )
    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('shows Active toggle as unchecked when active is false', () => {
    render(
      <MappingInfo
        mappingData={{ ...mockData, active: false }}
        setMappingData={mockSetMappingData}
      />
    )
    expect(screen.getByRole('checkbox')).not.toBeChecked()
  })

  it('calls setMappingData when toggle is clicked', () => {
    render(
      <MappingInfo mappingData={mockData} setMappingData={mockSetMappingData} />
    )
    fireEvent.click(screen.getByRole('checkbox'))
    expect(mockSetMappingData).toHaveBeenCalledWith(expect.any(Function))
  })
})
