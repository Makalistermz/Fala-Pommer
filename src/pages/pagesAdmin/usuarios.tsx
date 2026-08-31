// Permite consultar e gerenciar os setores cadastrados.
import { useState } from "react";
import UsuariosAtivos from "./usuarios/usuariosAtivos";
import UsuariosDesativados from "./usuarios/usuariosDesativados";
import HistoricoAdministrativo from "./usuarios/historicoAdministrativo";

type itemMenuUsuarios = {
    id: string;
    label: string;
};

const itensMenuSecretaria: itemMenuUsuarios[] = [
    {
        id: "ativos",
        label: "Usuários ativados",
    },
    {
        id: "desativados",
        label: "Usuários desativados",
    },
    {
        id: "historico",
        label: "Histórico Administrativo"
    }
]

function CriarUsers() {
    const [itemAtivo, setItemAtivo] = useState("ativos");

    function renderizarConteudo() {
        switch (itemAtivo) {
            case "ativos":
                return <UsuariosAtivos />;

            case "desativados":
                return <UsuariosDesativados />;

            case "historico": 
                return <HistoricoAdministrativo />

            default:
                return null;
        }
    }

    return (
        <section className="gerenciar-user">
            <nav
                className="gerenciar-user__pastas"
                aria-label="Escolha entre secretarias e setores"
            >
                {itensMenuSecretaria.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        className={`gerenciar-user__pasta ${
                            itemAtivo === item.id
                                ? "gerenciar-user__pasta--ativa"
                                : ""
                        }`}
                        onClick={() => setItemAtivo(item.id)}
                        aria-pressed={itemAtivo === item.id}
                    >

                        <span>{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="gerenciar-user__conteudo">
                {renderizarConteudo()}
            </div>
        </section>
    );
}

export default CriarUsers;