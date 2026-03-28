import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import PipelineInfo from '../pipelineInfo'
import { PipelineInfoState } from '../pipelineInfo'

const mockSetPipelineInfo = jest.fn()

const mockOrganizations = [
  { id: 'org-1', organizationName: 'Organization One' },
  { id: 'org-2', organizationName: 'Organization Two' },
]

const defaultPipelineInfo: PipelineInfoState = {
  pipelineName: '',
  description: '',
  organizationId: '',
}

const renderComponent = (
  overrides: Partial<PipelineInfoState> = {},
  isComplete = false
) =>
  render(
    <PipelineInfo
      pipelineInfo={{ ...defaultPipelineInfo, ...overrides }}
      setPipelineInfo={mockSetPipelineInfo}
      organizations={mockOrganizations}
      isComplete={isComplete}
    />
  )

describe('PipelineInfo Component', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders the pipeline info card', () => {
    renderComponent()
    expect(screen.getByTestId('pipeline-info-container')).toBeInTheDocument()
  })

  it('shows step number "1" when incomplete', () => {
    renderComponent()
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('does not show step number when complete', () => {
    renderComponent({}, true)
    expect(screen.queryByText('1')).not.toBeInTheDocument()
  })

  it('renders the Pipeline Name input', () => {
    renderComponent()
    expect(screen.getByTestId('pipeline-name-input')).toBeInTheDocument()
  })

  it('shows the current pipeline name value', () => {
    renderComponent({ pipelineName: 'My Pipeline' })
    expect(screen.getByTestId('pipeline-name-input')).toHaveValue('My Pipeline')
  })

  it('calls setPipelineInfo when pipeline name is changed', () => {
    renderComponent()
    const input = screen.getByTestId('pipeline-name-input')
    fireEvent.change(input, { target: { value: 'New Pipeline' } })
    expect(mockSetPipelineInfo).toHaveBeenCalledTimes(1)
  })

  it('renders the Description input', () => {
    renderComponent()
    expect(screen.getByTestId('pipeline-description-input')).toBeInTheDocument()
  })

  it('shows the current description value', () => {
    renderComponent({ description: 'Some description' })
    expect(screen.getByTestId('pipeline-description-input')).toHaveValue(
      'Some description'
    )
  })

  it('calls setPipelineInfo when description is changed', () => {
    renderComponent()
    const input = screen.getByTestId('pipeline-description-input')
    fireEvent.change(input, { target: { value: 'Updated' } })
    expect(mockSetPipelineInfo).toHaveBeenCalledTimes(1)
  })

  it('renders the organization combobox', () => {
    renderComponent()
    expect(screen.getByTestId('organization-select')).toBeInTheDocument()
  })

  it('shows description character count helper text', () => {
    renderComponent({ description: 'hello' })
    expect(screen.getByText('5/75')).toBeInTheDocument()
  })
})
