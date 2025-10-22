import { Suspense, lazy } from 'react'
import type { ClassKey } from 'keycloakify/login'
import type { KcContext } from './KcContext'
import { useI18n } from './i18n'
import DefaultPage from 'keycloakify/login/DefaultPage'
import Template from 'keycloakify/login/Template'

// ⬇️ ton override
import Login from './pages/Login'

const UserProfileFormFields = lazy(() => import('keycloakify/login/UserProfileFormFields'))

const doMakeUserConfirmPassword = true

export default function KcPage(props: { kcContext: KcContext }) {
  const { kcContext } = props
  const { i18n } = useI18n({ kcContext })

  return (
    <Suspense fallback={null}>
      {(() => {
        switch (kcContext.pageId) {
          case 'login.ftl':
            // ⬇️ on rend TA page custom (elle met déjà doUseDefaultCss={false})
            return (
              <Login
                kcContext={kcContext as any}
                i18n={i18n as any}
                Template={Template as any}
                classes={classes as any}
                doUseDefaultCss={false}
              />
            )

          default:
            // ⬇️ pour toutes les autres pages, on garde la page par défaut Keycloakify
            return (
              <DefaultPage
                kcContext={kcContext}
                i18n={i18n}
                classes={classes}
                Template={Template}
                doUseDefaultCss={true}
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
