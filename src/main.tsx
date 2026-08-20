// Inicializa a aplicação React no navegador.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { GoogleOAuthProvider } from "@react-oauth/google";
import App from "./App.tsx";
import { NavegacaoAudioProvider } from "./components/NavegacaoAudioProvider.tsx";
import { inicializarAltoContraste } from "./library/altoContraste.ts";
import "./index.css";

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
inicializarAltoContraste();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleOAuthProvider clientId={googleClientId}>
        <NavegacaoAudioProvider>
          <App />
        </NavegacaoAudioProvider>
      </GoogleOAuthProvider>
    </BrowserRouter>
  </StrictMode>
);
