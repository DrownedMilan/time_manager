import type { TemplateProps } from "keycloakify/login/TemplateProps";

export default function Template(props: TemplateProps<any, any>) {
  const { children } = props;

  // 👉 On supprime totalement le header et la structure par défaut
  // On ne garde que ton contenu custom

  return (
    <div id="kc-login">
      {children}
    </div>
  );
}
