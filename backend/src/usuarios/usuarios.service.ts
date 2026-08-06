import { BadRequestException, ConflictException, Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CriarUsuarioDto } from "./dto/criar-usuario.dto";
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async cadastrar(dados: CriarUsuarioDto) {

    if (dados.senha !== dados.confirmarSenha) {
        throw new BadRequestException("As senhas não coincidem");
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
}