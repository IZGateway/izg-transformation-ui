import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import CreateMapping from '../index'

// Mock next/router
const mockPush = jest.fn()
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: mockPush,
    query: {},
  }),
}))

// Mock API modules
jest.mock('../addMapping', () => ({
  addMapping: jest.fn(),
}))
jest.mock('../updateMapping', () => ({
  updateMapping: jest.fn(),
}))

import { addMapping } from '../addMapping'
import { updateMapping } from '../updateMapping'

const mockOrgs = [
  { id: 'org-1', name: 'Oklahoma', organizationName: 'Oklahoma' },
  { id: 'org-2', name: 'Texas', organizationName: 'Texas' },
]

const emptyMapping = {
  id: '',
  organizationId: '',
  organizationName: '',
  codeSystem: '',
  code: '',
  targetCodeSystem: '',
  targetCode: '',
  notes: '',
  active: true,
}

const existingMapping = {
  id: 'map-001',
  organizationId: 'org-1',
  organizationName: 'Oklahoma',
  codeSystem: 'SNOMED-CT',
  code: 'J07BB02',
  targetCodeSystem: 'CVX',
  targetCode: '141',
  notes: 'Flu vaccine mapping',
  active: true,
}

describe('CreateMapping - Add mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    sessionStorage.clear()
  })

  it('renders Add Mapping Entry title', () => {
    render(
      <CreateMapping
        mappingData={emptyMapping}
        organizationsData={mockOrgs}
      />
    )
    expect(screen.getByText('Add Mapping Entry')).toBeInTheDocument()
  })

  it('renders organization dropdown in add mode', () => {
    render(
      <CreateMapping
        mappingData={emptyMapping}
        organizationsData={mockOrgs}
      />
    )
    // MUI Select renders as a combobox role; getByLabelText doesn't work
    // because the InputLabel is not associated via a 'for' attribute
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', async () => {
    render(
      <CreateMapping
        mappingData={emptyMapping}
        organizationsData={mockOrgs}
      />
    )
    fireEvent.click(screen.getByText('SAVE'))
    await waitFor(() => {
      expect(
        screen.getByText('Please fill in all required fields.')
      ).toBeInTheDocument()
    })
  })

  it('calls addMapping and stores success message in sessionStorage on success', async () => {
    ;(addMapping as jest.Mock).mockResolvedValue({ success: true })

    render(
      <CreateMapping
        mappingData={{
          ...emptyMapping,
          organizationId: 'org-1',
          organizationName: 'Oklahoma',
          codeSystem: 'SNOMED-CT',
          code: 'J07BB02',
          targetCodeSystem: 'CVX',
          targetCode: '141',
        }}
        organizationsData={mockOrgs}
      />
    )

    fireEvent.click(screen.getByText('SAVE'))

    await waitFor(() => {
      expect(addMapping).toHaveBeenCalled()
      expect(sessionStorage.getItem('mappingSuccessMessage')).toBe(
        'Mapping created successfully!'
      )
      expect(mockPush).toHaveBeenCalledWith('/mapping')
    })
  })

  it('shows error snackbar when addMapping fails', async () => {
    ;(addMapping as jest.Mock).mockResolvedValue({
      success: false,
      error: 'Server error',
    })

    render(
      <CreateMapping
        mappingData={{
          ...emptyMapping,
          organizationId: 'org-1',
          organizationName: 'Oklahoma',
          codeSystem: 'SNOMED-CT',
          code: 'J07BB02',
          targetCodeSystem: 'CVX',
          targetCode: '141',
        }}
        organizationsData={mockOrgs}
      />
    )

    fireEvent.click(screen.getByText('SAVE'))

    await waitFor(() => {
      expect(screen.getByText('Server error')).toBeInTheDocument()
    })
  })
})

describe('CreateMapping - Edit mode', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders Edit Mapping Entry title', () => {
    render(
      <CreateMapping
        mappingData={existingMapping}
        organizationsData={mockOrgs}
      />
    )
    expect(screen.getByText('Edit Mapping Entry')).toBeInTheDocument()
  })

  it('renders disabled organization field with org name', () => {
    render(
      <CreateMapping
        mappingData={existingMapping}
        organizationsData={mockOrgs}
      />
    )
    const orgField = screen.getByDisplayValue('Oklahoma')
    expect(orgField).toBeDisabled()
  })

  it('pre-fills fields with existing mapping data', () => {
    render(
      <CreateMapping
        mappingData={existingMapping}
        organizationsData={mockOrgs}
      />
    )
    expect(screen.getByDisplayValue('J07BB02')).toBeInTheDocument()
    expect(screen.getByDisplayValue('SNOMED-CT')).toBeInTheDocument()
    expect(screen.getByDisplayValue('141')).toBeInTheDocument()
    expect(screen.getByDisplayValue('CVX')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Flu vaccine mapping')).toBeInTheDocument()
  })

  it('SAVE button is disabled when no changes made', () => {
    render(
      <CreateMapping
        mappingData={existingMapping}
        organizationsData={mockOrgs}
      />
    )
    expect(screen.getByText('SAVE').closest('button')).toBeDisabled()
  })

  it('SAVE button is enabled after a change', () => {
    render(
      <CreateMapping
        mappingData={existingMapping}
        organizationsData={mockOrgs}
      />
    )
    fireEvent.change(screen.getByDisplayValue('J07BB02'), {
      target: { value: 'NEWCODE' },
    })
    expect(screen.getByText('SAVE').closest('button')).not.toBeDisabled()
  })

  it('calls updateMapping and shows success snackbar on save', async () => {
    const mockMutate = jest.fn()
    ;(updateMapping as jest.Mock).mockResolvedValue({ success: true })

    render(
      <CreateMapping
        mappingData={existingMapping}
        mutateMapping={mockMutate}
        organizationsData={mockOrgs}
      />
    )

    fireEvent.change(screen.getByDisplayValue('J07BB02'), {
      target: { value: 'UPDATEDCODE' },
    })
    fireEvent.click(screen.getByText('SAVE'))

    await waitFor(() => {
      expect(updateMapping).toHaveBeenCalledWith(
        'map-001',
        expect.objectContaining({ code: 'UPDATEDCODE' })
      )
      expect(
        screen.getByText('Mapping updated successfully!')
      ).toBeInTheDocument()
      expect(mockMutate).toHaveBeenCalled()
    })
  })

  it('CLOSE button navigates to /mapping', () => {
    render(
      <CreateMapping
        mappingData={existingMapping}
        organizationsData={mockOrgs}
      />
    )
    fireEvent.click(screen.getByText('CLOSE'))
    expect(mockPush).toHaveBeenCalledWith('/mapping')
  })
})
