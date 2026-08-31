// Organiza as páginas disponíveis na área administrativa.
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import brasao from "../assets/img/brasao.webp";
import "./css/administracao.css";
import VisaoGeral from "./pagesAdmin/visaoGeral";
import RelatoriosLogs from "./pagesAdmin/relatoriosLogs";
import RelatorioError from "./pagesAdmin/relatoriosError";
import CriarSectors from "./pagesAdmin/criarSectors";
import CriarUsers from "./pagesAdmin/usuarios";

type ItemMenu = {
    id: string;
    label: string;
    title: string;
    icon: ReactNode;
};

const itensMenu: ItemMenu[] = [
    {
        id: "visao-geral",
        label: "Visão geral",
        title: "",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z" />
            </svg>
        ),
    },
    {
        id: "usuarios",
        label: "Usuários",
        title: "",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm8 1c-1.47 0-4.41.74-4.91 2.2C10.17 14.4 8.55 14 7 14c-2.33 0-7 1.17-7 3.5V21h13v-3.5c0-.47-.12-.88-.32-1.25.91-.66 2.34-1.25 3.32-1.25 1.86 0 4 .92 4 1.5V19h4v-2.5c0-2.33-5.67-3.5-8-3.5Z" />
            </svg>
        ),
    },
    {
        id: "criarSectors",
        label: "Secretarias/Setores",
        title: "Criação de secretarias ou setores",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 21V8l9-5 9 5v13h-7v-7h-4v7H3Zm3-8h2v-2H6v2Zm0 4h2v-2H6v2Zm10-4h2v-2h-2v2Zm0 4h2v-2h-2v2Z" />
            </svg>
        ),
    },
    {
        id: "relatorios-logs",
        label: "Relatórios de Login",
        title: "",
        icon: (
            <svg width="16" height="16" fill="currentColor" className="bi bi-key" viewBox="0 0 16 16">
                <path d="M0 8a4 4 0 0 1 7.465-2H14a.5.5 0 0 1 .354.146l1.5 1.5a.5.5 0 0 1 0 .708l-1.5 1.5a.5.5 0 0 1-.708 0L13 9.207l-.646.647a.5.5 0 0 1-.708 0L11 9.207l-.646.647a.5.5 0 0 1-.708 0L9 9.207l-.646.647A.5.5 0 0 1 8 10h-.535A4 4 0 0 1 0 8m4-3a3 3 0 1 0 2.712 4.285A.5.5 0 0 1 7.163 9h.63l.853-.854a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.646-.647a.5.5 0 0 1 .708 0l.646.647.793-.793-1-1h-6.63a.5.5 0 0 1-.451-.285A3 3 0 0 0 4 5"/>
                <path d="M4 8a1 1 0 1 1-2 0 1 1 0 0 1 2 0"/>
            </svg>
        ),
    },
    {
        id: "relatorios-error",
        label: "Relatórios de Erros",
        title: "",
        icon: (
            <svg width="16" height="16" fill="currentColor" className="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
            </svg>
        ),
    },
];

function Administracao() {
    const [menuAberto, setMenuAberto] = useState(true);
    const [itemAtivo, setItemAtivo] = useState("visao-geral");

    const itemSelecionado = itensMenu.find(
        (item) => item.id === itemAtivo
    );

    function renderizarConteudo() {
        switch (itemAtivo) {
            case "visao-geral":
                return <VisaoGeral />;

            case "usuarios":
                return <CriarUsers />;

            case "criarSectors":
                return <CriarSectors />;

            case "relatorios-logs":
                return <RelatoriosLogs />

            case "relatorios-error":
                return <RelatorioError />
        }
    }

    return (
        <div className={`administracao ${menuAberto ? "menu-aberto" : "menu-fechado"}`}>
            <aside className="admin-sidebar" aria-label="Menu de administração" data-lenis-prevent>
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
                        <h1>{itemSelecionado?.title || itemSelecionado?.label}</h1>
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
