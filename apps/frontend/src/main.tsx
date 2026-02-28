import React from "react";
import ReactDOM from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SnackbarProvider } from "notistack";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import App from "./App";
import { initAuth } from "./service/auth";

// Extract token from URL and persist to localStorage before anything else
initAuth();

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <SnackbarProvider maxSnack={3}>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </SnackbarProvider>
);
