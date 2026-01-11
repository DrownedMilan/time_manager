import type { Meta, StoryObj } from '@storybook/react'
import { createKcPageStory } from '../KcPageStory'

const { KcPageStory } = createKcPageStory({ pageId: 'login-reset-password.ftl' })

const meta = {
  title: 'Keycloak/ResetPassword',
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
      url: {
        loginAction: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
        loginUrl: 'http://localhost:4000/auth/realms/time-manager/login',
        loginResetCredentialsUrl: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
      },
      client_id: 'frontend',
      tab_id: 'test-tab-id',
    },
  },
}

export const WithError: Story = {
  args: {
    kcContext: {
      url: {
        loginAction: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
        loginUrl: 'http://localhost:4000/auth/realms/time-manager/login',
        loginResetCredentialsUrl: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
      },
      client_id: 'frontend',
      tab_id: 'test-tab-id',
      message: {
        type: 'error',
        summary: 'Invalid username or email.',
      },
      messagesPerField: {
        existsError: (field: string) => field === 'username',
        get: (field: string) => {
          if (field === 'username') return 'User not found'
          return ''
        },
      },
    },
  },
}

export const WithAttemptedUsername: Story = {
  args: {
    kcContext: {
      url: {
        loginAction: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
        loginUrl: 'http://localhost:4000/auth/realms/time-manager/login',
        loginResetCredentialsUrl: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
      },
      client_id: 'frontend',
      tab_id: 'test-tab-id',
      auth: {
        attemptedUsername: 'user@example.com',
      },
    },
  },
}

export const WithSuccessMessage: Story = {
  args: {
    kcContext: {
      url: {
        loginAction: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
        loginUrl: 'http://localhost:4000/auth/realms/time-manager/login',
        loginResetCredentialsUrl: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
      },
      client_id: 'frontend',
      tab_id: 'test-tab-id',
      message: {
        type: 'success',
        summary: 'If that username exists, a password reset email has been sent.',
      },
    },
  },
}

export const WithInfoMessage: Story = {
  args: {
    kcContext: {
      url: {
        loginAction: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
        loginUrl: 'http://localhost:4000/auth/realms/time-manager/login',
        loginResetCredentialsUrl: 'http://localhost:4000/auth/realms/time-manager/login-actions/reset-credentials',
      },
      client_id: 'frontend',
      tab_id: 'test-tab-id',
      message: {
        type: 'info',
        summary: 'Please enter your username or email address.',
      },
    },
  },
}
