// Contratos compartilhados entre a página Home e o chat, incluindo comunidades.
export type TipoUsuario = "user" | "admin" | "funcionario" | "superAdmin";

export type FiltroConversa = "todos" | "nao-lidas" | "grupos";

export interface UsuarioBasico {
    id: number;
    nome: string;
    foto_perfil_url: string | null;
}

export interface UsuarioConversa extends UsuarioBasico {
    tipoUsuario: TipoUsuario;
    setor: {
        id: number;
        nome: string;
        sigla: string;
    } | null;
}

export interface UsuarioAutenticado {
    sub: number;
    email: string;
    tipo: TipoUsuario;
}

export interface PerfilUsuario {
    nome: string;
    foto_perfil_url: string | null;
}

export interface UsuarioDigitando {
    id: number;
    nome: string;
}

export interface Setor {
    id: number;
    setor: string;
    sigla_setor: string;
    secretaria: {
        id: number;
        nome: string;
        sigla_secretaria: string;
    } | null;
}

export interface UltimaMensagem {
    id: number;
    conteudo: string;
    origem: "usuario" | "setor";
    sistema?: boolean;
    transferenciaId?: number | null;
    arquivoNome?: string | null;
    arquivoTipo?: string | null;
    enviadaEm: string;
}

export interface FinalizacaoPendente {
    id: number;
    finalizadaPorId: number;
    finalizadaPorNome: string;
    finalizadaEm: string;
}

export interface ConversaSetor {
    id: number;
    tipo: "setor";
    criadaEm: string;

    setor: {
        id: number;
        nome: string;
        sigla: string;
    };

    secretaria: {
        id: number;
        nome: string;
        sigla: string;
    }

    usuario: UsuarioBasico;
    mensagensNaoLidas: number;
    ultimaMensagem: UltimaMensagem | null;
    finalizacaoPendente: FinalizacaoPendente | null;
    ultimaFinalizacao: FinalizacaoPendente | null;
    podeFinalizar: boolean;
}

export interface ConversaPrivada {
    id: number;
    tipo: "privada";
    criadaEm: string;
    contato: {
        id: number;
        nome: string;
        tipo_usuario: TipoUsuario;
        foto_perfil_url: string | null;
    };
    somenteLeitura: boolean;
    mensagensNaoLidas: number;
    ultimaMensagem: UltimaMensagem | null;
}

export interface ConversaGrupo {
    id: number;
    tipo: "grupo";
    nome: string;
    criadaEm: string;
    participantes: Array<{
        id: number;
        nome: string;
        tipo_usuario: TipoUsuario;
        foto_perfil_url: string | null;
    }>;
    totalParticipantes: number;
    somenteLeitura: boolean;
    mensagensNaoLidas: number;
    ultimaMensagem: UltimaMensagem | null;
}

// Reutiliza os participantes do grupo e mantém separados os IDs da comunidade e da conversa.
export interface ConversaComunidade extends Omit<ConversaGrupo, 'tipo'> {
    tipo: 'comunidade';
    comunidadeId: number;
    imagem: string | null;
}

export type Conversa = ConversaSetor | ConversaPrivada | ConversaGrupo | ConversaComunidade;

export interface MensagemChat {
    id: number;
    conversaId: number;
    conteudo: string;
    origem: "usuario" | "setor";
    sistema: boolean;
    enviadaEm: string;
    // Existe apenas enquanto a mensagem ainda aguarda confirmação da API.
    statusEntrega?: "enviando";

    remetente: {
        tipo: "usuario" | "setor" | "admin" | "superAdmin";
        id: number;
        nome: string;
        fotoPerfilUrl?: string | null;
        tipoUsuario?: TipoUsuario;
        sigla_setor?: string;
    };

    autorReal?: {
        id: number;
        nome: string;
    };

    arquivo?: ArquivoMensagem | null;
    respondendoA?: {
        id: number;
        conteudo: string;
        remetente: {
            tipo: "usuario" | "setor" | "admin" | "superAdmin";
            id: number;
            nome: string;
            fotoPerfilUrl?: string | null;
            tipoUsuario?: TipoUsuario;
            sigla_setor?: string;
        };
        arquivo?: ArquivoMensagem | null;
    } | null;
}

export interface ArquivoMensagem {
    nome: string;
    url: string;
    tipo: "documento" | "imagem" | "video" | "audio";
    mime: string;
    tamanho: number;
}
