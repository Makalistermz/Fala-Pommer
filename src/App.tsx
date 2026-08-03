import { Routes, Route } from "react-router";
import "./App.css";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import RecuperarSenha from "./pages/recuperar-senha"
import RedefinirSenha from "./pages/RedefinirSenha";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/RedefinirSenha" element={<RedefinirSenha />} />
    </Routes>
  );
}

export default App;