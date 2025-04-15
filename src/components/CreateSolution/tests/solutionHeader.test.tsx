import React from 'react'
import { render, screen } from '@testing-library/react'
import SolutionHeader from '../solutionHeader'

describe('SolutionHeader', () => {
  it('renders request tab correctly', () => {
    render(<SolutionHeader currentSolutionTab="request" />)

    expect(
      screen.getByText('Creating a Solution (Request)')
    ).toBeInTheDocument()
    expect(
      screen.getByText((content) =>
        content.includes('Request operations handle')
      )
    ).toBeInTheDocument()
  })

  it('renders response tab correctly', () => {
    render(<SolutionHeader currentSolutionTab="response" />)

    expect(
      screen.getByText('Creating a Solution (Response)')
    ).toBeInTheDocument()
    expect(
      screen.getByText((content) =>
        content.includes('Response operations Process')
      )
    ).toBeInTheDocument()
  })
})
