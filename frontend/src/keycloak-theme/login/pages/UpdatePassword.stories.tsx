import type { Meta, StoryObj } from '@storybook/react'
import { createKcPageStory } from '../KcPageStory'

const { KcPageStory } = createKcPageStory({ pageId: 'update-password.ftl' })

const meta = {
  title: 'Keycloak/UpdatePassword',
  component: KcPageStory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof KcPageStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    kcContext: {
      execution: 'UPDATE_PASSWORD',
      client_id: 'frontend',
      tab_id: 'test-tab-id',
    },
  },
}

export const WithError: Story = {
  args: {
    kcContext: {
      execution: 'UPDATE_PASSWORD',
      client_id: 'frontend',
      tab_id: 'test-tab-id',
      message: {
        type: 'error',
        summary: 'Password confirmation does not match.',
      },
      messagesPerField: {
        existsError: (field: string) => field === 'password-new' || field === 'password-confirm',
        get: (field: string) => {
          if (field === 'password-new') return 'Password is too weak'
          if (field === 'password-confirm') return 'Passwords do not match'
          return ''
        },
      },
    },
  },
}

export const WithPasswordRequirements: Story = {
  args: {
    kcContext: {
      execution: 'UPDATE_PASSWORD',
      client_id: 'frontend',
      tab_id: 'test-tab-id',
      message: {
        type: 'warning',
        summary: 'Your password must be at least 8 characters long.',
      },
    },
  },
}
