function Setores() {
    const estiloObrigatorio: React.CSSProperties = {
        color: 'red',
    }
    const obrigatorio = <span style={estiloObrigatorio}>*</span>;

    return (
        <section className="setores">
            <header className="setores__header">
                <div>
                    <span>CONTROLE DE SETORES</span>
                    <h2 id="titulo-setores">Criação e controle dos setores</h2>
                    <p>Crie e acompanhe os setores do sistema</p>
                </div>
            </header>

            <div className="formulario-setor">
                <form method="POST" className="setor-form">
                    <div className="container-campo-setor">
                        <div className="campo-form-setor">
                            <label htmlFor="setor" >Setor{obrigatorio}</label>
                            <input
                            name="setor"
                            id="setor"
                            placeholder="Adicione o setor"
                            type="text"
                            required
                            />
                        </div>
                        <div className="campo-form-setor">
                            <label htmlFor="sigla_setor">Sigla do setor{obrigatorio}</label>
                            <input
                            name="sigla_setor"
                            id="sigla_setor"
                            placeholder="Adicione a sigla do setor"
                            type="text"
                            required
                            />
                        </div>
                    </div>

                    <button className="botao-enviar-setor" type="submit">Enviar</button>
                </form>
            </div>
        </section>
    )
}

export default Setores;