import type { Meta, StoryObj } from '@storybook/react'
import { createKcPageStory } from '../KcPageStory'

const { KcPageStory } = createKcPageStory({ pageId: 'login.ftl' })

const meta = {
  title: 'Keycloak/Login',
  component: KcPageStory,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof KcPageStory>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithError: Story = {
  args: {
    kcContext: {
      message: {
        type: 'error',
        summary: 'Invalid username or password.',
      },
      messagesPerField: {
        existsError: (field: string) => field === 'username' || field === 'password',
        get: (field: string) => {
          if (field === 'username') return 'Invalid username'
          if (field === 'password') return 'Invalid password'
          return ''
        },
      },
    },
  },
}

export const WithSocialProviders: Story = {
  args: {
    kcContext: {
      social: {
        providers: [
          {
            alias: 'google',
            providerId: 'google',
            displayName: 'Google',
            loginUrl: '#',
          },
        ],
      },
    },
  },
}
