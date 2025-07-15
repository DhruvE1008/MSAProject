import "../index.css"
import type { Meta, StoryObj } from "@storybook/react"
import Sidebar from "../components/Sidebar"
import { MemoryRouter } from "react-router-dom"
import { ThemeProvider } from "../ThemeContext"

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={["/"]}>
        <ThemeProvider>
          {/* The div below is for formatting so that the sidebar is on the left side of the page. */}
          <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            <Story />
            {/* dummy text*/}
            <div className="flex-1 p-6">
              <p className="text-gray-800 dark:text-gray-100">
                This is the main content area next to the sidebar.
              </p>
            </div>
          </div>
        </ThemeProvider>
      </MemoryRouter>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof Sidebar>

export const Default: Story = {}
