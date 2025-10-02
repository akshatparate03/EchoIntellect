import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

const rootElement = document.getElementById("root");
if (rootElement) {
  createRoot(rootElement).render(<RouterProvider router={router} />);
}
