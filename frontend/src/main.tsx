import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { BrowserRouter } from "react-router-dom";
import { lightTheme, darkTheme } from "@/themes";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
// import RoutesConfig from "@/routes"; 

export function Main() {
    const [mode, setMode] = useState<"light" | "dark">("light");
    const theme = useMemo(() => (mode === "light" ? lightTheme : darkTheme), [mode]);
    const toggleTheme = () => setMode((prev) => (prev === "light" ? "dark" : "light"));

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <BrowserRouter>
                <App toggleTheme={toggleTheme} mode={mode} />
            </BrowserRouter>
        </ThemeProvider>
    );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Main />
    </React.StrictMode>
);
