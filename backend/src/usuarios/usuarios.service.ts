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

  }
}