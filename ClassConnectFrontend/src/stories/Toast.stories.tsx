import React, { useState } from 'react'
import { Meta, StoryObj } from '@storybook/react'
import Toast from '../components/Toast'

const meta: Meta<typeof Toast> = {
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
