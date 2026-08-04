import { Routes, Route } from "react-router";
import "./App.css";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import RecuperarSenha from "./pages/recuperar-senha"
import RedefinirSenha from "./pages/RedefinirSenha";
import Home from "./pages/home";
import RotaProtegida from "./components/RotaProtegida";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/RedefinirSenha" element={<RedefinirSenha />} />
      <Route
        element={
          <RotaProtegida
            perfisPermitidos={["user", "admin", "funcionario"]}
          />
        }
      >
        <Route path="/home" element={<Home />} />
      </Route>
    </Routes>
  );
}

//verificar se /home na url funciona sem login

export default App;
