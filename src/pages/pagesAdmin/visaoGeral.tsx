function VisaoGeral() {

    return (
        <section className="admin-welcome" aria-labelledby="titulo-boas-vindas">
            <div>
                <span className="admin-welcome-tag">Administração</span>
                <h2 id="titulo-boas-vindas">Bem-vindo ao painel</h2>
                <p>Gerencie as informações e configurações do Fala Pommer pelo menu lateral.</p>
            </div>
            <div className="admin-welcome-decoration" aria-hidden="true">
                <span />
                <span />
                <span />
            </div>
        </section>
    )
}

export default VisaoGeral;