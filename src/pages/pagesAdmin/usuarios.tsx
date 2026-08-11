import { useEffect, useState } from "react";

interface Usuario {
    id: number;
    nome: string;
    telefone: string;
    email: string;
}

function Usuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);

    useEffect(() => {
        async function carregarUsuarios() {
            const token = localStorage.getItem("access_token");

            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/usuarios`,
                {
                    headers: {
                    Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar os usuários");
            }

            const dados: Usuario[] = await resposta.json();
            setUsuarios(dados);
        }

        carregarUsuarios().catch(console.error);
        }, []);

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
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.id}</td>
                                    <td>{usuario.nome}</td>
                                    <td>{usuario.telefone}</td>
                                    <td>{usuario.email}</td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </section>
    )
}

export default Usuarios;