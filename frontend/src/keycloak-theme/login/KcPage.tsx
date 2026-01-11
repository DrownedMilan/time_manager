import { Suspense, lazy } from 'react'
import type { ClassKey } from 'keycloakify/login'
import type { KcContext } from './KcContext'
import { useI18n } from './i18n'
import DefaultPage from 'keycloakify/login/DefaultPage'
import Template from './Template'

import Login from './pages/Login'
import UpdatePassword from './pages/UpdatePassword'

const UserProfileFormFields = lazy(() => import('keycloakify/login/UserProfileFormFields'))

const doMakeUserConfirmPassword = true

export default function KcPage(props: { kcContext: KcContext }) {
  const { kcContext } = props
  const { i18n } = useI18n({ kcContext })

  return (
    <Suspense fallback={null}>
      {(() => {
        // Check if this is an update password required action
        const isUpdatePassword =
          kcContext.pageId === 'update-password.ftl' ||
          (kcContext as any).pageId === 'update-password.ftl' ||
          (kcContext as any).url?.loginAction?.includes('UPDATE_PASSWORD') ||
          (kcContext as any).execution === 'UPDATE_PASSWORD'

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

          case 'update-password.ftl':
            return (
              <UpdatePassword
                kcContext={kcContext as any}
                i18n={i18n as any}
                Template={Template as any}
                classes={classes as any}
                doUseDefaultCss={false}
              />
            )

          default:
            // Fallback: check if it's an update password page by URL or execution
            if (isUpdatePassword) {
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
