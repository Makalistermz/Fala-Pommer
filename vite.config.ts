// Configura o servidor de desenvolvimento do frontend.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

  // Permite acessar o frontend pela rede local.
  server: {
    host: "0.0.0.0",
    port: 5173,
    // Evita iniciar o servidor em outra porta automaticamente.
    strictPort: true,
  },
});
