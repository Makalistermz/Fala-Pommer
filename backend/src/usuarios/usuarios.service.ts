import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import { AtualizarUsuarioDto } from "./dto/atualizar-usuario.dto";
import * as bcrypt from 'bcrypt';
import { cpf, cnpj } from 'cpf-cnpj-validator'

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async cadastrar(dados: CriarUsuarioDto) {

    if (dados.senha !== dados.confirmarSenha) {
        throw new BadRequestException("As senhas não coincidem");
    }

    const dataNascimento = new Date(dados.dataNascimento);
    const anoNascimento = dataNascimento.getFullYear();

    if (anoNascimento > 2014) {
        throw new BadRequestException("Informe uma data de nascimento antes de 2014.")
    }

    if (anoNascimento < 1925) {
        throw new BadRequestException("Informe uma data de nascimento a partir de 1926.")
    }
    
    const temMinuscula = /[a-z]/.test(dados.senha);
    const temMaiuscula = /[A-Z]/.test(dados.senha);
    const temNumero = /[0-9]/.test(dados.senha);
    const temEspecial = /[^0-9A-Za-z\s]/.test(dados.senha);

    if (!temMinuscula || !temMaiuscula || !temNumero || !temEspecial) {
        throw new BadRequestException("Insira uma senha mais forte contendo letras maiúsculas, minúsculas, números e símbolos")
    }

    const usuarioExistente = await this.prisma.cadastro.findFirst({
        where: {
            OR: [
                { email: dados.email },
                { cpf: dados.cpf },
            ],
        },
    });

    if (usuarioExistente) {
        throw new ConflictException("Já existe usuario com este CPF ou E-mail");
    }

    const SALT_ROUNDS = 12;

    const senhaHash = await bcrypt.hash(
        dados.senha,
        SALT_ROUNDS,
    );

    const cpfLimpo = dados.cpf.replace(/\D/g, "");
    const telefoneLimpo = dados.numeroTelefone.replace(/\D/g, "");

    const usuarioCriado = await this.prisma.cadastro.create({
        data: {  // Contém o que será inserido
            nome: dados.nome,
            data_nascimento: new Date(
                `${dados.dataNascimento}T00:00:00.000Z`,
            ),
            cpf: cpfLimpo,
            telefone: telefoneLimpo,
            email: dados.email.trim().toLowerCase(),
            senha: senhaHash,
        },
        select: {  // Determina o que será devolvido ao React
            id: true,
            nome: true,
            data_nascimento: true,
            cpf: true,
            telefone: true,
            email: true,
        },
    });

    return usuarioCriado;

  }

    async buscarPorEmail(email: string) {
        return this.prisma.cadastro.findFirst({
            where: {
                email,
            }
        });
    }

    async listarUsuariosParaConversa() {
        return this.prisma.cadastro.findMany({
            where: {
                tipo_usuario: "user"
            },

            select: {
                id: true,
                nome: true
            },

            orderBy: {
                nome: "asc"
            }
        });
    }

    async listarTodos() {
        return this.prisma.cadastro.findMany({
            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo_usuario: true,
                setor_id: true,
            },
            orderBy: {
                id: "asc",
            },
        });
    }

    async atualizar(id: number, dados: AtualizarUsuarioDto) {
        const usuario = await this.prisma.cadastro.findUnique({
            where: { id },
            select: { id: true },
        });

        if (!usuario) {
            throw new NotFoundException("Usuário não encontrado.");
        }

        const email = dados.email.trim().toLowerCase();
        const usuarioComMesmoEmail = await this.prisma.cadastro.findFirst({
            where: {
                email,
                id: { not: id },
            },
            select: { id: true },
        });

        if (usuarioComMesmoEmail) {
            throw new ConflictException("Já existe outro usuário com este e-mail.");
        }

        if (dados.setor_id != null) {
            const setor = await this.prisma.setores.findUnique({
                where: { id: dados.setor_id },
                select: { id: true },
            });

            if (!setor) {
                throw new BadRequestException("Setor não encontrado.");
            }
        }

        return this.prisma.cadastro.update({
            where: { id },
            data: {
                telefone: dados.telefone.trim(),
                email,
                tipo_usuario: dados.tipo_usuario,
                setor_id: dados.setor_id ?? null,
            },
            select: {
                id: true,
                nome: true,
                telefone: true,
                email: true,
                tipo_usuario: true,
                setor_id: true,
            },
        });
    }

    async apagar(id: number) {
        const resultado = await this.prisma.cadastro.deleteMany({
            where: { id },
        });

        if (resultado.count === 0) {
            throw new NotFoundException("Usuário não encontrado.");
        }

        return { mensagem: "Usuário apagado com sucesso." };
    }
}
