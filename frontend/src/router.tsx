import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Chat from "./pages/Chat";
import ShareView from "./pages/ShareView";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "chat", element: <Chat /> },
      { path: "chat/:id", element: <Chat /> },
      { path: "compare", element: <Navigate to="/chat" replace /> }, // old link
      { path: "share/:id", element: <ShareView /> },
    ],
  },
  { path: "/login", element: <Login /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

export default router;
