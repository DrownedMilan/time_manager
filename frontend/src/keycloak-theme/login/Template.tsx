import type { TemplateProps } from "keycloakify/login/TemplateProps";

export default function Template(props: TemplateProps<any, any>) {
  const { children } = props;

  return (
    <div id="kc-login">
      {children}
    </div>
  );
}
