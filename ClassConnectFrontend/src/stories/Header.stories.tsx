// this file is for the storybook advanced feature in the MSA guidelines.
// I have created a storybook for all the UI components in the application.
// This will help in testing the components in isolation and also help in documenting the components.
import "../index.css"

// meta is imported for the metadata of the storybook UI
// StoryObj is imported to define the type of the story
// makes sure that the story is typed correctly
import type { Meta, StoryObj } from '@storybook/react'
import Header from "../components/Header"
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../ThemeContext'

// the metadata for the UI
const meta: Meta<typeof Header> = {
  title: "Components/Header",
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  // decorators are used to wrap the story with additional context or functionality.
  decorators: [
    (Story) => (
      // MemoryRouter is used to provide routing context for the story
      // initialEntries is used to set the initial route for the story
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          {/* the div below is basically for formatting so that the header is at the top of the page.*/}
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Story is the component that will be rendered i.e. the header component in this case. */}
            <Story />
          </div>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
}

export default meta

// story is a header story object.
type Story = StoryObj<typeof Header>

// Default story rendering the Header in Storybook
export const Default: Story = {}
