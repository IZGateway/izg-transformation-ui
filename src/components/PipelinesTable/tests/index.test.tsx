import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import PipelinesTable from '../index'
import { AppProvider } from '../../../contexts/app'

jest.mock('@mui/x-data-grid', () => {
  const React = require('react')

  return {
    DataGrid: ({ rows, columns }) => (
      <div data-testid="data-grid">
        {rows.map((row) => (
          <div key={row.id} data-testid={`row-${row.id}`}>
            {columns.map((column) => {
              const key = `${row.id}-${column.field}`
              const value = row[column.field]

              return (
                <div key={key} data-testid={`cell-${key}`}>
                  {column.renderCell
                    ? column.renderCell({ value, row })
                    : String(value ?? '')}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    ),
    GridFooter: () => <div data-testid="grid-footer" />,
    GridToolbar: () => <div data-testid="grid-toolbar" />,
  }
})

jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => <>{children}</>
})

const renderComponent = (data: any[]) =>
  render(
    <AppProvider>
      <PipelinesTable data={data} />
    </AppProvider>
  )

describe('PipelinesTable toggle status', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    global.fetch = jest.fn()
  })

  it('calls GET and PUT and updates status text after toggle', async () => {
    const pipeline = {
      id: 'pipe-1',
      organizationName: 'Test Org',
      pipelineName: 'Pipeline A',
      inboundEndpoint: 'inbound',
      outboundEndpoint: 'outbound',
      description: 'desc',
      active: true,
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...pipeline, active: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...pipeline, active: false }),
      })

    renderComponent([pipeline])

    expect(screen.getByText('Active')).toBeInTheDocument()

    fireEvent.click(screen.getByLabelText('toggle-pipeline-status'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    expect(global.fetch).toHaveBeenNthCalledWith(1, '/api/pipelines/pipe-1')

    const putCall = (global.fetch as jest.Mock).mock.calls[1]
    expect(putCall[0]).toBe('/api/pipelines/pipe-1')
    expect(putCall[1].method).toBe('PUT')

    const putBody = JSON.parse(putCall[1].body)
    expect(putBody.active).toBe(false)

    await waitFor(() => {
      expect(screen.getByText('Disabled')).toBeInTheDocument()
    })
  })

  it('derives next active value from fetched pipeline payload', async () => {
    const staleRow = {
      id: 'pipe-2',
      organizationName: 'Org',
      pipelineName: 'Pipeline B',
      inboundEndpoint: 'inbound',
      outboundEndpoint: 'outbound',
      description: 'desc',
      active: true,
    }

    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...staleRow, active: false }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...staleRow, active: true }),
      })

    renderComponent([staleRow])

    fireEvent.click(screen.getByLabelText('toggle-pipeline-status'))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    const putCall = (global.fetch as jest.Mock).mock.calls[1]
    const putBody = JSON.parse(putCall[1].body)

    // fetched active=false should produce active=true, even though row showed active=true
    expect(putBody.active).toBe(true)
  })
})
