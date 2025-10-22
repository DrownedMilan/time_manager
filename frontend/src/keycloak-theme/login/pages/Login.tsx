import { useState } from 'react'
import type { PageProps } from 'keycloakify/login/pages/PageProps'
import type { KcContext } from '../KcContext'
import type { I18n } from '../i18n'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Clock, Building2 } from 'lucide-react'

import '../../../index.css'

export default function Login(props: PageProps<Extract<KcContext, { pageId: 'login.ftl' }>, I18n>) {
  const { kcContext, i18n, Template } = props
  const { msgStr } = i18n
  const { url, messagesPerField, message, realm } = kcContext

  const [username, setUsername] = useState(kcContext.login?.username ?? '')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    e.currentTarget.submit()
  }

  const globalMessage = typeof message === 'string' ? message : (message?.toString?.() ?? undefined)

  const fieldErr = (name: 'username' | 'password') =>
    messagesPerField.existsError(name) ? messagesPerField.get(name) : undefined

  return (
    <Template
      kcContext={kcContext}
      i18n={i18n}
      doUseDefaultCss={false}
      headerNode={null} // ✅ pas de header Keycloak
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-white/10 rounded-full border border-white/20">
                  <Building2 className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-white text-3xl font-bold mb-2">Bank Clock</h1>
              <p className="text-white/70">Employee Time Management System</p>
            </div>

            {globalMessage && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {globalMessage}
              </div>
            )}

            <form action={url.loginAction} method="post" onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/90">
                  Email
                </Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20"
                  required
                  disabled={loading}
                />
                {fieldErr('username') && (
                  <p className="text-red-300 text-xs">{fieldErr('username')}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-sm focus:bg-white/20"
                  required
                  disabled={loading}
                />
                {fieldErr('password') && (
                  <p className="text-red-300 text-xs">{fieldErr('password')}</p>
                )}
              </div>

              <input
                type="hidden"
                name="credentialId"
                value={kcContext.auth?.selectedCredential ?? ''}
              />

              <Button
                type="submit"
                className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {msgStr('doLogIn')}
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    {msgStr('doLogIn')}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 text-white/70 text-sm text-center">
              {realm.registrationAllowed && (
                <>
                  <a href={url.registrationUrl} className="hover:underline">
                    {msgStr('doRegister')}
                  </a>
                  {' · '}
                </>
              )}
              <a href={url.loginResetCredentialsUrl} className="hover:underline">
                {msgStr('doForgotPassword')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </Template>
  )
}
