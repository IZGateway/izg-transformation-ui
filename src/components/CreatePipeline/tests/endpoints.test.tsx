import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Endpoints, { EndpointsState } from '../endpoints'

const mockSetEndpointsInfo = jest.fn()

const defaultEndpointsInfo: EndpointsState = {
  inboundEndpoint: '',
  outboundEndpoint: '',
}

const renderComponent = (
  overrides: Partial<EndpointsState> = {},
  isComplete = false
) =>
  render(
    <Endpoints
      endpointsInfo={{ ...defaultEndpointsInfo, ...overrides }}
      setEndpointsInfo={mockSetEndpointsInfo}
      isComplete={isComplete}
    />
  )

describe('Endpoints Component', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the endpoints card', () => {
    renderComponent()
    expect(screen.getByTestId('endpoints-container')).toBeInTheDocument()
  })

  it('shows step number "2" when incomplete', () => {
    renderComponent()
    expect(screen.getByText('2')).toBeInTheDocument()
  })

  it('does not show step number when complete', () => {
    renderComponent({}, true)
    expect(screen.queryByText('2')).not.toBeInTheDocument()
  })

  it('renders the Inbound Endpoint field', () => {
    renderComponent()
    expect(screen.getByTestId('inbound-endpoint-select')).toBeInTheDocument()
  })

  it('renders the Outbound Endpoint field', () => {
    renderComponent()
    expect(screen.getByTestId('outbound-endpoint-select')).toBeInTheDocument()
  })

  it('renders the Endpoints section title', () => {
    renderComponent()
    expect(screen.getByText('Endpoints')).toBeInTheDocument()
  })

  it('shows selected inbound endpoint value', () => {
    renderComponent({ inboundEndpoint: 'izgts:IISHubService' })
    expect(screen.getByTestId('inbound-endpoint-select')).toHaveValue(
      'izgts:IISHubService'
    )
  })

  it('shows selected outbound endpoint value', () => {
    renderComponent({ outboundEndpoint: 'izghub:IISHubService' })
    expect(screen.getByTestId('outbound-endpoint-select')).toHaveValue(
      'izghub:IISHubService'
    )
  })
})
