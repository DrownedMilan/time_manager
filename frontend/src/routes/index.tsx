import { createBrowserRouter } from "react-router-dom";
import UsersPage from "@/pages/UsersPage";
import LoginPage from "@/pages/LoginPage";

export const router = createBrowserRouter([
  { path: "/", element: <UsersPage /> },
  {path: "/login", element: <LoginPage /> }
]);
