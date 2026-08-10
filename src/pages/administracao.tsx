import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import brasao from "../assets/img/brasao.png";
import "./css/administracao.css";
import VisaoGeral from "./pagesAdmin/visaoGeral";

type ItemMenu = {
    id: string;
    label: string;
    icon: ReactNode;
};

const itensMenu: ItemMenu[] = [
    {
        id: "visao-geral",
        label: "Visão geral",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />
            </svg>
        ),
    },
    {
        id: "usuarios",
        label: "Usuários",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1c-1.47 0-4.41.74-4.91 2.2C10.17 14.4 8.55 14 7 14c-2.33 0-7 1.17-7 3.5V21h13v-3.5c0-.47-.12-.88-.32-1.25.91-.66 2.34-1.25 3.32-1.25 1.86 0 4 .92 4 1.5V19h4v-2.5c0-2.33-5.67-3.5-8-3.5Z" />
            </svg>
        ),
    },
    {
        id: "setores",
        label: "Setores",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 21V8l9-5 9 5v13h-7v-7h-4v7H3Zm3-8h2v-2H6v2Zm0 4h2v-2H6v2Zm10-4h2v-2h-2v2Zm0 4h2v-2h-2v2Z" />
            </svg>
        ),
    },
    {
        id: "relatorios",
        label: "Relatórios",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 14h2v-5H7v5Zm4 0h2V7h-2v10Zm4 0h2V9h-2v8Z" />
            </svg>
        ),
    },
    {
        id: "configuracoes",
        label: "Configurações",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m19.43 12.98.04-.98-.04-.98 2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.61-.22l-2.49 1a7.3 7.3 0 0 0-1.69-.98L14.5 2.42A.49.49 0 0 0 14 2h-4a.49.49 0 0 0-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1a.49.49 0 0 0-.61.22l-2 3.46a.49.49 0 0 0 .12.64l2.11 1.65-.04.98.04.98-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46c.12.22.38.31.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.04.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.58 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65ZM12 15.5A3.5 3.5 0 1 1 12 8a3.5 3.5 0 0 1 0 7.5Z" />
            </svg>
        ),
    },
];

function Administracao() {
    const [menuAberto, setMenuAberto] = useState(true);
    const [itemAtivo, setItemAtivo] = useState("visao-geral");

    function renderizarConteudo() {
        switch (itemAtivo) {
            case "visao-geral":
                return <VisaoGeral />;
        }
    }

    return (
        <div className={`administracao ${menuAberto ? "menu-aberto" : "menu-fechado"}`}>
            <aside className="admin-sidebar" aria-label="Menu de administração">
                <div className="admin-sidebar-header">
                    <img className="admin-logo" src={brasao} alt="Fala Pommer" />
                    <div className="admin-brand">
                        <strong>Fala Pommer</strong>
                        <span>Administração</span>
                    </div>

                    <button
                        className="admin-toggle"
                        type="button"
                        onClick={() => setMenuAberto((aberto) => !aberto)}
                        aria-label={menuAberto ? "Fechar menu lateral" : "Abrir menu lateral"}
                        aria-expanded={menuAberto}
                        title={menuAberto ? "Fechar menu" : "Abrir menu"}
                    >
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="m14.7 6.3-1.4-1.4L6.2 12l7.1 7.1 1.4-1.4-5.6-5.7 5.6-5.7Zm4 0-1.4-1.4-7.1 7.1 7.1 7.1 1.4-1.4-5.6-5.7 5.6-5.7Z" />
                        </svg>
                    </button>
                </div>

                <nav className="admin-nav">
                    <span className="admin-nav-title">MENU</span>
                    {itensMenu.map((item) => (
                        <button
                            key={item.id}
                            className={`admin-nav-item ${itemAtivo === item.id ? "ativo" : ""}`}
                            type="button"
                            onClick={() => setItemAtivo(item.id)}
                            title={!menuAberto ? item.label : undefined}
                            aria-current={itemAtivo === item.id ? "page" : undefined}
                        >
                            <span className="admin-nav-icon">{item.icon}</span>
                            <span className="admin-nav-label">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <Link className="admin-nav-item" to="/home" title={!menuAberto ? "Voltar ao início" : undefined}>
                        <span className="admin-nav-icon">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5Z" />
                            </svg>
                        </span>
                        <span className="admin-nav-label">Voltar ao início</span>
                    </Link>
                </div>
            </aside>

            <main className="admin-content">
                <header className="admin-content-header">
                    <div>
                        <span className="admin-eyebrow">PAINEL ADMINISTRATIVO</span>
                        <h1>{itensMenu.find((item) => item.id === itemAtivo)?.label}</h1>
                    </div>
                </header>
                <div className="admin-page-content">
                    {renderizarConteudo()}
                </div>
            </main>
        </div>
    );
}

export default Administracao;
