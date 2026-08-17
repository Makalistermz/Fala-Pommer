import { useEffect, useState } from "react";
import { ModalFeedback } from "../../components/ModalFeedback";

interface Perfil {
    id: number;
    nome: string;
    email: string;
    telefone: string;
    tipo_usuario: "user" | "admin" | "funcionario";
    setor: {
        id: number;
        setor: string;
        sigla_setor: string;
    } | null;
}

const preferencias = [
    {
        id: "notificacoes",
        label: "Notificações de mensagens",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 5.75A2.75 2.75 0 0 1 7.75 3h8.5A2.75 2.75 0 0 1 19 5.75v6.5A2.75 2.75 0 0 1 16.25 15H9l-4 3v-12.25Z" />
            </svg>
        ),
    },
    {
        id: "leitura",
        label: "Confirmação de leitura",
        icon: (
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m3.5 12.5 4 4L14 8" />
                <path d="m10 14.5 2 2L20.5 8" />
            </svg>
        ),
    },
];

function formatarTelefone(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);

    if (numeros.length === 0) {
        return "";
    }

    if (numeros.length <= 2) {
        return `(${numeros}`;
    }

    const ddd = numeros.slice(0, 2);
    const quantidadePrimeiraParte = numeros.length === 11 ? 5 : 4;
    const primeiraParte = numeros.slice(2, 2 + quantidadePrimeiraParte);
    const segundaParte = numeros.slice(2 + quantidadePrimeiraParte);

    return `(${ddd}) ${primeiraParte}${
        segundaParte ? `-${segundaParte}` : ""
    }`;
}

function MeuPerfil() {
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [formulario, setFormulario] = useState({
        nome: "",
        email: "",
        telefone: "",
    });
    const [salvando, setSalvando] = useState(false);
    const [feedback, setFeedback] = useState({
        aberto: false,
        tipo: "erro" as "erro" | "sucesso",
        mensagem: "",
    });

    useEffect(() => {
        async function carregarPerfil() {
            const token = localStorage.getItem("access_token");

            if (!token) {
                return
            }

            const resposta = await fetch(`${import.meta.env.VITE_API_URL}/usuarios/me`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                },
            );

            if (!resposta.ok) {
                throw new Error("Não foi possível carregar o perfil.");
            }

            const dados: Perfil = await resposta.json();
            setPerfil(dados);
            setFormulario({
                nome: dados.nome,
                email: dados.email,
                telefone: formatarTelefone(dados.telefone),
            });
        }

        carregarPerfil().catch(console.error);
    }, []);

    function cancelarAlteracoes() {
        if (!perfil) {
            return;
        }

        setFormulario({
            nome: perfil.nome,
            email: perfil.email,
            telefone: formatarTelefone(perfil.telefone),
        });
    }

    async function salvarAlteracoes() {
        const token = localStorage.getItem("access_token");

        if (!token) {
            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: "Sua sessão expirou. Entre novamente para continuar.",
            });
            return;
        }

        setSalvando(true);

        try {
            const resposta = await fetch(
                `${import.meta.env.VITE_API_URL}/usuarios/me`,
                {
                    method: "PATCH",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        nome: formulario.nome,
                        email: formulario.email,
                        telefone: formulario.telefone.replace(/\D/g, ""),
                    }),
                },
            );

            const resultado = await resposta.json() as
                | Perfil
                | { message?: string | string[] };

            if (!resposta.ok) {
                const mensagem = "message" in resultado
                    ? resultado.message
                    : undefined;

                throw new Error(
                    Array.isArray(mensagem)
                        ? mensagem.join(" ")
                        : mensagem ?? "Não foi possível salvar as alterações.",
                );
            }

            const perfilAtualizado = resultado as Perfil;
            setPerfil(perfilAtualizado);
            setFormulario({
                nome: perfilAtualizado.nome,
                email: perfilAtualizado.email,
                telefone: formatarTelefone(perfilAtualizado.telefone),
            });
            setFeedback({
                aberto: true,
                tipo: "sucesso",
                mensagem: "As alterações foram salvas com sucesso.",
            });
        } catch (erro) {
            setFeedback({
                aberto: true,
                tipo: "erro",
                mensagem: erro instanceof Error
                    ? erro.message
                    : "Não foi possível salvar as alterações.",
            });
        } finally {
            setSalvando(false);
        }
    }

    return (
        <main className="meu-perfil">
            <div className="meu-perfil__grade">
                <section className="meu-perfil__cartao meu-perfil__cartao--dados">
                    <header className="meu-perfil__resumo">
                        <div className="meu-perfil__avatar" aria-hidden="true">
                            {perfil?.nome.charAt(0).toUpperCase()}
                        </div>

                        <div className="meu-perfil__identidade">
                            <strong className="meu-perfil__nome">
                                {perfil?.nome ?? "Carregando..."}
                            </strong>

                            <span className="meu-perfil__perfil">
                                {perfil?.tipo_usuario}
                            </span>

                            <button
                                className="meu-perfil__alterar-foto"
                                type="button"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M4 7.5h3l1.4-2h7.2l1.4 2h3a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9.5a2 2 0 0 1 2-2Z" />
                                    <circle cx="12" cy="13.5" r="3.5" />
                                </svg>
                                <span>Alterar foto</span>
                            </button>
                        </div>
                    </header>

                    <div className="meu-perfil__divisor" />

                    <form
                        className="meu-perfil__formulario"
                        onSubmit={(evento) => {
                            evento.preventDefault();
                            void salvarAlteracoes();
                        }}
                    >
                        <div className="meu-perfil__campo">
                            <label htmlFor="nome_completo">Nome completo</label>
                            <input
                                id="nome_completo"
                                type="text"
                                value={formulario.nome}
                                onChange={(evento) =>
                                    setFormulario((dadosAtuais) => ({
                                        ...dadosAtuais,
                                        nome: evento.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="meu-perfil__campo">
                            <label htmlFor="e-mail">E-mail</label>
                            <input
                                id="e-mail"
                                type="email"
                                value={formulario.email}
                                onChange={(evento) =>
                                    setFormulario((dadosAtuais) => ({
                                        ...dadosAtuais,
                                        email: evento.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="meu-perfil__campo">
                            <label htmlFor="telefone">Telefone</label>
                            <input
                                id="telefone"
                                type="tel"
                                inputMode="numeric"
                                maxLength={15}
                                value={formulario.telefone}
                                onChange={(evento) =>
                                    setFormulario((dadosAtuais) => ({
                                        ...dadosAtuais,
                                        telefone: formatarTelefone(
                                            evento.target.value,
                                        ),
                                    }))
                                }
                            />
                        </div>

                        <div className="meu-perfil__campo">
                            <label htmlFor="setor">Setor</label>
                            <input
                                id="setor"
                                type="text"
                                value={perfil?.setor?.setor ?? ""}
                                readOnly
                            />
                        </div>

                        <div className="meu-perfil__acoes">
                            <button
                                className="meu-perfil__salvar"
                                type="submit"
                                disabled={salvando || !perfil}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M5 3h12l3 3v15H4V4a1 1 0 0 1 1-1Z" />
                                    <path d="M8 3v6h8V3M8 21v-7h8v7" />
                                </svg>
                                <span>
                                    {salvando ? "Salvando..." : "Salvar alterações"}
                                </span>
                            </button>

                            <button
                                className="meu-perfil__cancelar"
                                type="button"
                                onClick={cancelarAlteracoes}
                                disabled={salvando || !perfil}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </section>

                <aside className="meu-perfil__lateral">
                    <section className="meu-perfil__cartao meu-perfil__preferencias">
                        <h2>Preferências rápidas</h2>

                        <div className="meu-perfil__preferencias-lista">
                            {preferencias.map((preferencia) => (
                                <div
                                    className="meu-perfil__preferencia"
                                    key={preferencia.id}
                                >
                                    <span className="meu-perfil__preferencia-icone">
                                        {preferencia.icon}
                                    </span>

                                    <span className="meu-perfil__preferencia-texto">
                                        {preferencia.label}
                                    </span>

                                    <span
                                        className="meu-perfil__switch meu-perfil__switch--ativo"
                                        role="switch"
                                        aria-checked="true"
                                        aria-label={preferencia.label}
                                        onClick={(e) => {
                                                        e.currentTarget.classList.toggle('meu-perfil__switch--ativo');
                                                    }
                                                }
                                    >
                                        <span />
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="meu-perfil__cartao meu-perfil__seguranca">
                        <h2>Segurança da conta</h2>

                        <div className="meu-perfil__seguranca-conteudo">
                            <div
                                className="meu-perfil__seguranca-icone"
                                aria-hidden="true"
                            >
                                <svg viewBox="0 0 24 24">
                                    <path d="M12 3 5.5 6v5.5c0 4.2 2.7 7.9 6.5 9.5 3.8-1.6 6.5-5.3 6.5-9.5V6L12 3Z" />
                                    <path d="m9 12 2 2 4-4" />
                                </svg>
                            </div>

                            <div className="meu-perfil__seguranca-info">
                                <p>Sua conta está protegida</p>

                                <a
                                    href="/recuperar-senha"
                                    className="meu-perfil__alterar-senha"
                                    type="button"
                                    target="_blank"
                                >
                                    <svg viewBox="0 0 24 24" aria-hidden="true">
                                        <circle cx="8" cy="15" r="3" />
                                        <path d="m10.2 12.8 6.3-6.3a2.1 2.1 0 1 1 3 3l-1 1-1.5-1.5-1.5 1.5 1.5 1.5-1.5 1.5-1.5-1.5-3.8 3.8" />
                                    </svg>
                                    <span>Alterar senha</span>
                                </a>
                            </div>
                        </div>
                    </section>
                </aside>
            </div>

            <ModalFeedback
                aberto={feedback.aberto}
                tipo={feedback.tipo}
                mensagem={feedback.mensagem}
                aoFechar={() =>
                    setFeedback((estadoAtual) => ({
                        ...estadoAtual,
                        aberto: false,
                    }))
                }
            />
        </main>
    );
}

export default MeuPerfil;
