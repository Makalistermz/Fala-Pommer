// Define as rotas disponíveis na aplicação.
import { Routes, Route } from "react-router";
import { useEffect } from "react";
import "./App.css";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import RecuperarSenha from "./pages/recuperar-senha"
import RedefinirSenha from "./pages/RedefinirSenha";
import Home from "./pages/home";
import RotaProtegida from "./components/RotaProtegida";
import Sectors from "./pages/sectors";
import SemPermissao from "./components/SemPermissao";
import Administracao from "./pages/administracao";
import { initLenis } from "./library/lenis.ts"
import Configuracao from "./pages/configuracao.tsx"
import NaoEncontrada from "./pages/naoEncontrada.tsx";

function App() {
    useEffect(() => {
      const lenis = initLenis();

      return () => {
        lenis.destroy();
      };
    }, []);

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/RedefinirSenha" element={<RedefinirSenha />} />
      <Route path="/SemPermissao" element={<SemPermissao />} />
      <Route path="*" element={<NaoEncontrada />} />

      <Route
        element={
          <RotaProtegida
            perfisPermitidos={["admin", "funcionario", "user", "superAdmin"]}
          />
        }
      >
        <Route path="/configuracao" element={<Configuracao />} />
      </Route>

      <Route 
        element={
          <RotaProtegida
            perfisPermitidos={["superAdmin"]}
          />
        }
      >
        <Route path="/administracao" element={<Administracao />} />
      </Route>

      <Route
        element={
          <RotaProtegida
            perfisPermitidos={["admin", "funcionario", "superAdmin"]}
          />
        }
      >
        <Route path="/home" element={<Home />} />
      </Route>

      <Route
        element={
          <RotaProtegida
            perfisPermitidos={["user"]}
          />
        }
      >
        <Route path="/sectors" element={<Sectors />} />
      </Route>

    </Routes>
  );
}


export default App;
