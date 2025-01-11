import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Settings from '../settings'

const mockPipeData = {
  inboundEndpoint: 'Mock Inbound',
  outboundEndpoint: 'Mock Outbound',
}

const mockOrgData = {
  active: true,
  id: '1',
  organizationName: 'Test Org',
  commonName: 'Test Common',
}

describe('Settings Component', () => {
  it('renders the Settings title', () => {
    render(<Settings pipeData={mockPipeData} orgData={mockOrgData} />)
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays the correct organization name', () => {
    render(<Settings pipeData={mockPipeData} orgData={mockOrgData} />)
    expect(screen.getByText('Test Org')).toBeInTheDocument()
  })

  it('displays the correct inbound endpoint', () => {
    render(<Settings pipeData={mockPipeData} orgData={mockOrgData} />)
    expect(screen.getByText('Mock Inbound')).toBeInTheDocument()
  })

  it('displays the correct outbound endpoint', () => {
    render(<Settings pipeData={mockPipeData} orgData={mockOrgData} />)
    expect(screen.getByText('Mock Outbound')).toBeInTheDocument()
  })

  it('renders all form controls', () => {
    render(<Settings pipeData={mockPipeData} orgData={mockOrgData} />)
    expect(screen.getByLabelText('Organization')).toBeInTheDocument()
    expect(screen.getByLabelText('Input Endpoint')).toBeInTheDocument()
    expect(screen.getByLabelText('Output Endpoint')).toBeInTheDocument()
  })

  it('disables all select inputs', () => {
    render(<Settings pipeData={mockPipeData} orgData={mockOrgData} />)
    expect(screen.getByTestId('organization-select')).toBeDisabled()
    expect(screen.getByTestId('input-endpoint-select')).toBeDisabled()
    expect(screen.getByTestId('output-endpoint-select')).toBeDisabled()
  })
})
