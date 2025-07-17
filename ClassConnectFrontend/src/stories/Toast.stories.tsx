// the storybook configuration for the Toast component
// which displays notifications to the user.
// It allows users to see success or error messages in a visually appealing way.
import React, { useState } from 'react'
import { Meta, StoryObj } from '@storybook/react'
import Toast from '../components/Toast'

const meta: Meta<typeof Toast> = {
  // Meta information for the Toast component
  // This includes the title for the story, the component itself, and any additional configurations.
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'radio',
      options: ['success', 'error'],
    },
    message: { control: 'text' },
    duration: { control: 'number' },
  },
}

export default meta
type Story = StoryObj<typeof Toast>

const ToastWrapper = ({ ...args }) => {
  const [show, setShow] = useState(true)

  return (
    <>
      <button
        onClick={() => setShow(true)}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          background: '#ddd',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
      >
        Show Toast
      </button>

      {show && (
        <Toast
              message={''} type={'success'} {...args}
              onClose={() => setShow(false)}        />
      )}
    </>
  )
}

// shows the success and error toast messages in the storybook
export const Success: Story = {
  render: (args) => <ToastWrapper {...args} />,
  args: {
    message: 'Operation completed successfully!',
    type: 'success',
    duration: 3000,
  },
}

export const Error: Story = {
  render: (args) => <ToastWrapper {...args} />,
  args: {
    message: 'Something went wrong!',
    type: 'error',
    duration: 3000,
  },
}
