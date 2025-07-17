// the storybook configuration for the SwitchingThemes component which allows users to switch between light
//  and dark themes.
import { Meta, StoryObj } from '@storybook/react'
import SwitchingThemes from '../components/SwitchingThemes'
import { ThemeProvider } from '../ThemeContext'

const meta: Meta<typeof SwitchingThemes> = {
  title: 'Components/SwitchingThemes',
  component: SwitchingThemes,
  decorators: [
    (Story) => (
      <ThemeProvider>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors p-4">
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
}

export default meta

type Story = StoryObj<typeof SwitchingThemes>

export const Default: Story = {}
