import "../index.css"
import type { Meta, StoryObj } from '@storybook/react'
import Layout from '../components/Layout'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../ThemeContext'

// Define metadata for the Storybook UI
const meta: Meta<typeof Layout> = {
  title: 'Components/Layout',
  component: Layout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <ThemeProvider>
          <Story />
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Layout>

// Create a mock page content to pass as `children`
const MockPage = () => (
  <div className="space-y-4">
    <h1 className="text-2xl font-bold">Welcome to the Dashboard</h1>
    <p className="text-base">This is a demo page inside the layout.</p>
    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
      Example Button
    </button>
  </div>
)

// Export the story using `children` as props
export const Default: Story = {
  render: () => <Layout><MockPage /></Layout>
}
