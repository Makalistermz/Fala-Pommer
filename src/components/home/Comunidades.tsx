import "./Comunidades.css";

function Comunidades() {
    return (
        <header className="comunidades-header">
            <div className="comunidades-header__conteudo">
                <strong className="comunidades-header__titulo">
                    Comunidades
                </strong>
                
                <button
                    type="button"
                    className="comunidades-header__adicionar"
                    aria-label="Criar nova comunidade"
                    title="Criar nova comunidade"
                >
                    <svg
                        width="20"
                        height="20"
                        fill="currentColor"
                        className="bi bi-plus-circle"
                        viewBox="0 0 16 16"
                        aria-hidden="true"
                    >
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                    </svg>
                </button>
            </div>
        </header>
    );
}

export default Comunidades;
