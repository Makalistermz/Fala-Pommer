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

      <Route
        element={
          <RotaProtegida
            perfisPermitidos={["admin", "funcionario"]}
          />
        }
      >
        <Route path="/home" element={<Home />} />
        <Route path="/administracao" element={<Administracao />} />
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
