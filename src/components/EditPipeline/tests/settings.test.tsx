import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Settings from '../settings'

const mockOnEndpointChange = jest.fn()
const mockOnDescriptionChange = jest.fn()

const mockPipeData = {
  inboundEndpoint: 'izgts:IISHubService',
  outboundEndpoint: 'izghub:IISHubService',
  description: 'Test description',
}

const mockOrgData = {
  active: true,
  id: '1',
  organizationName: 'Test Org',
  commonName: 'Test Common',
}

const renderSettings = (pipeData = mockPipeData) =>
  render(
    <Settings
      pipeData={pipeData}
      orgData={mockOrgData}
      onEndpointChange={mockOnEndpointChange}
      onDescriptionChange={mockOnDescriptionChange}
    />
  )

describe('Settings Component', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the Settings title', () => {
    renderSettings()
    expect(screen.getByText('Settings')).toBeInTheDocument()
  })

  it('displays the correct organization name', () => {
    renderSettings()
    expect(screen.getByText('Test Org')).toBeInTheDocument()
  })

  it('disables the organization select', () => {
    renderSettings()
    expect(screen.getByTestId('organization-select')).toBeDisabled()
  })

  it('renders the Input Endpoint field', () => {
    renderSettings()
    expect(screen.getByTestId('input-endpoint-select')).toBeInTheDocument()
  })

  it('renders the Output Endpoint field', () => {
    renderSettings()
    expect(screen.getByTestId('output-endpoint-select')).toBeInTheDocument()
  })

  it('renders the Description field with current value', () => {
    renderSettings()
    expect(screen.getByTestId('pipeline-description-input')).toHaveValue(
      'Test description'
    )
  })

  it('calls onDescriptionChange when description is modified', () => {
    renderSettings()
    const field = screen.getByTestId('pipeline-description-input')
    fireEvent.change(field, { target: { value: 'Updated description' } })
    expect(mockOnDescriptionChange).toHaveBeenCalledWith('Updated description')
  })

  it('renders the description character count helper text', () => {
    renderSettings()
    expect(screen.getByText('16/250')).toBeInTheDocument()
  })

  it('renders description as empty when not provided', () => {
    renderSettings({ ...mockPipeData, description: undefined })
    expect(screen.getByTestId('pipeline-description-input')).toHaveValue('')
  })
})
