function Usuarios() {
    return (
        <section className="usuarios">
            <header className="usuarios__header">
                <div>
                    <span>CONTROLE DE USUÁRIOS</span>
                    <h2 id="titulo-usuarios">Alterar cargo e setor do usuário</h2>
                    <p>Ajuste o cargo e o setor de atuação do usuário no sistema.</p>
                </div>
            </header>

            <div className="usuarios__tabela-container">
                <table className="usuarios__tabela">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Nome</th>
                            <th scope="col">Telefone</th>
                            <th scope="col">Email</th>
                        </tr>
                    </thead>

                    <tbody>
                            <tr>
                                <td></td>
                                <td></td>
                            </tr>
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default Usuarios;