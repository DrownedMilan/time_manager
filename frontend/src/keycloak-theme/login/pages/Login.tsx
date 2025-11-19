import { useState } from "react";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Mail, Lock } from "lucide-react";
import logo from "../../../../public/primebank_logo.png"

import "../../../index.css";

export default function Login(
  props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>
) {
  const { kcContext, i18n, Template } = props;
  const { msgStr } = i18n;
  const { url, messagesPerField, message } = kcContext;

  const [username, setUsername] = useState(kcContext.login?.username ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
  };

  const globalMessage =
    typeof message === "string"
      ? message
      : message?.summary ?? undefined;

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
              <p className="text-white/60 text-sm mt-2">Time Management Dashboard</p>
            </div>

            {/* Global error */}
            {globalMessage && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                {globalMessage}
              </div>
            )}

            {/* KEYCLOAK LOGIN FORM */}
            <form action={url.loginAction} method="post" onSubmit={onSubmit} className="space-y-6">

              {/* Username */}
              <div className="space-y-2">
                <Label htmlFor="username" className="text-white/80">Username or Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:bg-white/10"
                    required
                  />
                </div>

                {messagesPerField.existsError("username") && (
                  <p className="text-red-300 text-xs">
                    {messagesPerField.get("username")}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/80">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-blue-400/50 focus:bg-white/10"
                    required
                  />
                </div>

                {messagesPerField.existsError("password") && (
                  <p className="text-red-300 text-xs">
                    {messagesPerField.get("password")}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
              >
                {msgStr("doLogIn")}
              </Button>

            </form>

            {/* Forgot password */}
            <div className="mt-8 pt-6 border-t border-white/10 text-white/70 text-sm text-center">
              <a href={url.loginResetCredentialsUrl} className="hover:underline">
                {msgStr("doForgotPassword")}
              </a>
            </div>

          </div>
        </div>

      </div>
    </Template>
  );
}
