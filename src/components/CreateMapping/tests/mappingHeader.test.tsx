import React from 'react'
import { render, screen } from '@testing-library/react'
import MappingHeader from '../mappingHeader'

describe('MappingHeader', () => {
  it('renders "Creating a Mapping" title in add mode', () => {
    render(<MappingHeader isEditMode={false} />)
    expect(screen.getByText('Creating a Mapping')).toBeInTheDocument()
  })

  it('renders "Editing a Mapping" title in edit mode', () => {
    render(<MappingHeader isEditMode={true} />)
    expect(screen.getByText('Editing a Mapping')).toBeInTheDocument()
  })

  it('renders add description text in add mode', () => {
    render(<MappingHeader isEditMode={false} />)
    expect(
      screen.getByText((content) =>
        content.includes('Create a new mapping to define')
      )
    ).toBeInTheDocument()
  })

  it('renders edit description text in edit mode', () => {
    render(<MappingHeader isEditMode={true} />)
    expect(
      screen.getByText((content) =>
        content.includes('Update the mapping details below')
      )
    ).toBeInTheDocument()
  })
})
