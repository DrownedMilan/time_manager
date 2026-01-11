import { Suspense, lazy } from 'react'
import type { ClassKey } from 'keycloakify/login'
import type { KcContext } from './KcContext'
import { useI18n } from './i18n'
import DefaultPage from 'keycloakify/login/DefaultPage'
import Template from './Template'

import Login from './pages/Login'
import UpdatePassword from './pages/UpdatePassword'
import ResetPassword from './pages/ResetPassword'

const UserProfileFormFields = lazy(() => import('keycloakify/login/UserProfileFormFields'))

const doMakeUserConfirmPassword = true

export default function KcPage(props: { kcContext: KcContext }) {
  const { kcContext } = props
  const { i18n } = useI18n({ kcContext })

  return (
    <Suspense fallback={null}>
      {(() => {
        // Check if this is an update password required action
        const kcContextAny = kcContext as any
        const isUpdatePassword =
          kcContextAny.pageId === 'update-password.ftl' ||
          kcContextAny.url?.loginAction?.includes('UPDATE_PASSWORD') ||
          kcContextAny.execution === 'UPDATE_PASSWORD'

        // Check if it's a reset password page BEFORE the switch
        // This allows us to catch it even if pageId doesn't match
        const url = kcContextAny.url
        const currentUrl = typeof window !== 'undefined' ? window.location.href : ''
        const execution = kcContextAny.execution
        const isResetCredentialsFlow =
          execution === 'RESET_CREDENTIALS' ||
          (typeof url?.loginAction === 'string' && url.loginAction.includes('reset-credentials')) ||
          url?.loginResetCredentialsUrl !== undefined ||
          (typeof currentUrl === 'string' &&
            (currentUrl.includes('reset-credentials') ||
              currentUrl.includes('login-actions/reset-credentials')))

        switch (kcContext.pageId) {
          case 'login.ftl':
            return (
              <Login
                kcContext={kcContext as any}
                i18n={i18n as any}
                Template={Template as any}
                classes={classes as any}
                doUseDefaultCss={false}
              />
            )

          case 'login-reset-password.ftl':
          case 'login-username.ftl':
            return (
              <ResetPassword
                kcContext={kcContext as any}
                i18n={i18n as any}
                Template={Template as any}
                classes={classes as any}
                doUseDefaultCss={false}
              />
            )

          default:
            // If we detected reset credentials flow, use ResetPassword even if pageId doesn't match
            if (isResetCredentialsFlow) {
              return (
                <ResetPassword
                  kcContext={kcContext as any}
                  i18n={i18n as any}
                  Template={Template as any}
                  classes={classes as any}
                  doUseDefaultCss={false}
                />
              )
            }
            // Fallback: check if it's an update password page by URL or execution
            if (isUpdatePassword || kcContextAny.pageId === 'update-password.ftl') {
              return (
                <UpdatePassword
                  kcContext={kcContext as any}
                  i18n={i18n as any}
                  Template={Template as any}
                  classes={classes as any}
                  doUseDefaultCss={false}
                />
              )
            }
            return (
              <DefaultPage
                kcContext={kcContext}
                i18n={i18n}
                classes={classes}
                Template={Template}
                doUseDefaultCss={false}
                UserProfileFormFields={UserProfileFormFields}
                doMakeUserConfirmPassword={doMakeUserConfirmPassword}
              />
            )
        }
      })()}
    </Suspense>
  )
}

const classes = {} satisfies { [key in ClassKey]?: string }
