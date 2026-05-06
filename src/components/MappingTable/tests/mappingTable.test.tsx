import React from 'react'
import { render, screen } from '@testing-library/react'
import MappingTable from '../index'

// Mock @mui/x-data-grid so cells and the footer slot render in JSDOM
jest.mock('@mui/x-data-grid', () => ({
  DataGrid: ({ rows, columns, slots }: any) => (
    <div data-testid="mock-datagrid">
      {rows.map((row: any) => (
        <div key={row.id} data-testid={`row-${row.id}`}>
          {columns.map((col: any) => (
            <div key={col.field}>
              {col.renderCell
                ? col.renderCell({ row, value: row[col.field] })
                : String(row[col.field] ?? '')}
            </div>
          ))}
        </div>
      ))}
      {slots?.footer?.()}
    </div>
  ),
  GridFooter: () => <div data-testid="grid-footer" />,
  GridToolbar: () => <div data-testid="grid-toolbar" />,
}))

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: any) => (
    <a href={href?.pathname || href}>{children}</a>
  )
})

// Mock context
jest.mock('../../../contexts/app', () => ({
  __esModule: true,
  default: React.createContext({
    pageSize: 5,
    setPageSize: jest.fn(),
  }),
}))

const mockData = [
  {
    id: 'map-001',
    organizationName: 'Oklahoma',
    codeSystem: 'SNOMED-CT',
    code: 'J07BB02',
    targetCodeSystem: 'CVX',
    targetCode: '141',
    active: true,
  },
  {
    id: 'map-002',
    organizationName: 'Texas',
    codeSystem: 'ICD-10',
    code: 'Z23',
    targetCodeSystem: 'LOINC',
    targetCode: '99999',
    active: false,
  },
]

describe('MappingTable', () => {
  it('renders the Mapping title', () => {
    render(<MappingTable data={mockData} />)
    expect(screen.getByText('Mapping')).toBeInTheDocument()
  })

  it('renders Active badge for active mappings', () => {
    render(<MappingTable data={mockData} />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders Not Active badge for inactive mappings', () => {
    render(<MappingTable data={mockData} />)
    expect(screen.getByText('Not Active')).toBeInTheDocument()
  })

  it('renders Add New Mapping button in footer', () => {
    render(<MappingTable data={mockData} />)
    expect(screen.getByText('Add New Mapping')).toBeInTheDocument()
  })

  it('Add New Mapping button links to /add/mapping', () => {
    render(<MappingTable data={mockData} />)
    const link = screen.getByText('Add New Mapping').closest('a')
    expect(link).toHaveAttribute('href', '/add/mapping')
  })

  it('renders edit button for each row', () => {
    render(<MappingTable data={mockData} />)
    const editButtons = screen.getAllByLabelText('edit')
    expect(editButtons).toHaveLength(mockData.length)
  })

  it('edit button links to correct edit path', () => {
    render(<MappingTable data={mockData} />)
    // aria-label="edit" is on the IconButton; navigate up to the wrapping <a>
    const editButtons = screen.getAllByLabelText('edit')
    const firstLink = editButtons[0].closest('a')
    expect(firstLink).toHaveAttribute('href', '/edit/mapping/map-001')
  })
})
