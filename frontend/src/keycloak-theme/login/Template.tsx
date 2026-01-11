import type { TemplateProps } from 'keycloakify/login/TemplateProps'

export default function Template(props: TemplateProps<any, any>) {
  const { children } = props

  return (
    <div id="kc-login">
      <style>{`
        /* Force ALL text in error containers to be red/white - very aggressive override */
        #kc-login .kc-feedback-text,
        #kc-login .kc-alert,
        #kc-login .kc-alert-error,
        #kc-login .alert,
        #kc-login .alert-error,
        #kc-login .alert-warning,
        #kc-login [role="alert"],
        #kc-login .pf-c-alert,
        #kc-login .pf-c-alert__title,
        #kc-login .pf-c-alert__description,
        #kc-login .pf-m-danger,
        #kc-login .pf-m-warning,
        #kc-login .kc-form-group-error,
        #kc-login .kc-feedback-icon,
        #kc-login .kc-input-error,
        #kc-login .error,
        #kc-login .warning,
        #kc-login p.error,
        #kc-login span.error,
        #kc-login div.error,
        #kc-login .kc-text-error,
        #kc-login .kc-text-warning,
        /* Target all p, span, div elements that might contain error messages */
        #kc-login p[class*="error"],
        #kc-login span[class*="error"],
        #kc-login div[class*="error"],
        #kc-login p[class*="alert"],
        #kc-login span[class*="alert"],
        #kc-login div[class*="alert"],
        /* Force text color for all children of error containers */
        #kc-login .bg-red-500\\/20,
        #kc-login .bg-red-500\\/20 *,
        #kc-login [class*="bg-red"] *,
        #kc-login [class*="border-red"] * {
          color: rgb(252, 165, 165) !important; /* text-red-300 */
        }
        
        /* Background for error alerts */
        #kc-login .kc-alert-error,
        #kc-login .alert-error,
        #kc-login .pf-c-alert.pf-m-danger,
        #kc-login [role="alert"].pf-m-danger {
          background-color: rgba(239, 68, 68, 0.2) !important; /* bg-red-500/20 */
          border-color: rgba(239, 68, 68, 0.3) !important; /* border-red-500/30 */
        }
        
        /* Force text color for elements with text-red classes that might be overridden */
        #kc-login [class*="text-red"] {
          color: rgb(252, 165, 165) !important; /* text-red-300 */
        }
        
        /* Override any inline styles or computed styles that might set color to black */
        #kc-login [style*="color"] {
          color: rgb(252, 165, 165) !important;
        }
      `}</style>
      {children}
    </div>
  )
}
