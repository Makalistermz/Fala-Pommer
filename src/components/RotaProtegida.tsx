import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router";

type TipoUsuario = "user" | "admin" | "funcionario";

interface RotaProtegidaProps {
    perfisPermitidos: TipoUsuario[];
}

type Situacao =
    | "carregando"
    | "permitido"
    | "negado"
    | "deslogado";

function RotaProtegida({
    perfisPermitidos
}: RotaProtegidaProps) {
    const [situacao, setSituacao] =
        useState<Situacao>("carregando");

    useEffect(() => {
        async function verificarPermissao() {
            const token =
                localStorage.getItem("access_token");

            if (!token) {
                setSituacao("deslogado");
                return;
            }

            try {
                const resposta = await fetch(
                    `${import.meta.env.VITE_API_URL}/auth/perfil`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                if (resposta.status === 401) {
                    setSituacao("deslogado");
                    return;
                }

                if (!resposta.ok) {
                    setSituacao("negado");
                    return;
                }

                const usuario = await resposta.json();

                if (
                    perfisPermitidos.includes(usuario.tipo)
                ) {
                    setSituacao("permitido");
                } else {
                    setSituacao("negado");
                }
            } catch {
                setSituacao("deslogado");
            }
        }

        verificarPermissao();
    }, [perfisPermitidos]);

    if (situacao === "carregando") {
        return <p>Verificando permissão...</p>;
    }

    if (situacao === "deslogado") {
        return <Navigate to="/" replace />;
    }

    if (situacao === "negado") {
        return <Navigate to="/SemPermissao" replace />;
    }

    return <Outlet />;
}

export default RotaProtegida;