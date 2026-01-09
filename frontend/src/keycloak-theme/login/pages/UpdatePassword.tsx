import { useState } from 'react'
import type { PageProps } from 'keycloakify/login/pages/PageProps'
import type { KcContext } from '../KcContext'
import type { I18n } from '../i18n'

import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Lock, KeyRound, AlertCircle } from 'lucide-react'
import logo from '../../../../public/primebank_logo.png'

import '../../../index.css'

export default function UpdatePassword(
  props: PageProps<Extract<KcContext, { pageId: 'update-password.ftl' }>, I18n>,
) {
  const { kcContext, i18n, Template } = props
  const { msgStr } = i18n
  const { url, messagesPerField, message } = kcContext

  const [password, setPassword] = useState('')
  const [passwordNew, setPasswordNew] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)

  const onSubmit = () => {
    setLoading(true)
  }

  const globalMessage = typeof message === 'string' ? message : (message?.summary ?? undefined)

  return (
    <Template kcContext={kcContext} i18n={i18n} doUseDefaultCss={false} headerNode={undefined}>
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="w-full max-w-md relative">
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 shadow-2xl">
            {/* Logo */}
            <div className="flex flex-col items-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg p-3">
                <img src={logo} alt="PrimeBank Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-white/90">PrimeBank</h1>
              <p className="text-white/60 text-sm mt-2">Change Your Password</p>
            </div>

            {/* Info message */}
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-white/90 font-medium text-sm">
                    {msgStr('updatePasswordTitle')}
                  </p>
                  <p className="text-white/60 text-xs">
                    You must change your temporary password before continuing.
                  </p>
                </div>
              </div>
            </div>

            {/* Global error */}
            {globalMessage && (
              <div
                className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm"
                style={{ color: 'rgb(252, 165, 165)' }}
              >
                {globalMessage}
              </div>
            )}

            {/* KEYCLOAK UPDATE PASSWORD FORM */}
            <form action={url.loginAction} method="post" onSubmit={onSubmit} className="space-y-6">
              {/* Hidden fields for Keycloak */}
              {(kcContext as any).execution && (
                <input type="hidden" name="execution" value={(kcContext as any).execution} />
              )}
              {(kcContext as any).client_id && (
                <input type="hidden" name="client_id" value={(kcContext as any).client_id} />
              )}
              {(kcContext as any).tab_id && (
                <input type="hidden" name="tab_id" value={(kcContext as any).tab_id} />
              )}
              {(kcContext as any).client_data && (
                <input type="hidden" name="client_data" value={(kcContext as any).client_data} />
              )}

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="password-new" className="text-white/80">
                  {msgStr('passwordNew')}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password-new"
                    name="password-new"
                    type="password"
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:bg-white/10"
                    required
                    autoFocus
                  />
                </div>

                {messagesPerField.existsError('password-new') && (
                  <p className="text-red-300 text-xs" style={{ color: 'rgb(252, 165, 165)' }}>
                    {messagesPerField.get('password-new')}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="password-confirm" className="text-white/80">
                  {msgStr('passwordConfirm')}
                </Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password-confirm"
                    name="password-confirm"
                    type="password"
                    value={passwordConfirm}
                    onChange={(e) => setPasswordConfirm(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:bg-white/10"
                    required
                  />
                </div>

                {messagesPerField.existsError('password-confirm') && (
                  <p className="text-red-300 text-xs" style={{ color: 'rgb(252, 165, 165)' }}>
                    {messagesPerField.get('password-confirm')}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                {loading ? 'Updating...' : msgStr('doSubmit')}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Template>
  )
}
