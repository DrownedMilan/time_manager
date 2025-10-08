// import React from "react";
import { AppBar, Toolbar, Typography, Button } from "@mui/material";
import { Link } from "react-router-dom";

interface AppProps {
  toggleTheme: () => void;
  mode: "light" | "dark";
}

export default function App({ toggleTheme, mode }: AppProps) {
  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              color: "inherit",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Time Manager
          </Typography>

          <Button
            color="inherit"
            onClick={toggleTheme}
            sx={{
              textTransform: "none",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            {mode === "light" ? "Toggle Dark" : "Toggle Light"}
          </Button>
        </Toolbar>
      </AppBar>

    </>
  );
}
