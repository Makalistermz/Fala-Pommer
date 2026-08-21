import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma/prisma.service';
import { UsuariosService } from '../usuarios/usuarios.service';
import { AuthService } from './auth.service';
import { TwoFactorEmailService } from './two-factor-email.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService - autenticação em duas etapas', () => {
  const usuariosMock = {
    buscarPorEmail: jest.fn(),
  };
  const jwtMock = {
    signAsync: jest.fn(),
  };
  const prismaMock = {
    cadastro: {
      findFirst: jest.fn(),
    },
    login_evento: {
      create: jest.fn(),
    },
  };
  const twoFactorMock = {
    iniciarLogin: jest.fn(),
    verificarCodigo: jest.fn(),
    verificarCodigoRecuperacao: jest.fn(),
  };

  let service: AuthService;

  const usuario = {
    id: 7,
    nome: 'Usuário Teste',
    email: 'usuario@exemplo.com',
    senha: 'hash-da-senha',
    tipo_usuario: 'user' as const,
    dois_fatores_email_ativo: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    prismaMock.login_evento.create.mockResolvedValue({});
    jwtMock.signAsync.mockResolvedValue('jwt-final');

    service = new AuthService(
      usuariosMock as unknown as UsuariosService,
      jwtMock as unknown as JwtService,
      prismaMock as unknown as PrismaService,
      twoFactorMock as unknown as TwoFactorEmailService,
    );
  });

  it('interrompe o login e retorna somente o desafio quando o 2FA está ativo', async () => {
    usuariosMock.buscarPorEmail.mockResolvedValue(usuario);
    twoFactorMock.iniciarLogin.mockResolvedValue({
      token: 'token-do-desafio',
      email_mascarado: 'u***o@exemplo.com',
      expira_em: new Date('2026-08-21T15:05:00.000Z'),
    });

    const resultado = await service.signIn(usuario.email, 'Senha!123');

    expect(resultado).toEqual(
      expect.objectContaining({
        requer_segunda_etapa: true,
        token: 'token-do-desafio',
      }),
    );
    expect(resultado).not.toHaveProperty('access_token');
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
    expect(prismaMock.login_evento.create).not.toHaveBeenCalled();
  });

  it('conclui diretamente o login quando o 2FA está inativo', async () => {
    usuariosMock.buscarPorEmail.mockResolvedValue({
      ...usuario,
      dois_fatores_email_ativo: false,
    });

    const resultado = await service.signIn(usuario.email, 'Senha!123');

    expect(resultado).toEqual(
      expect.objectContaining({
        requer_segunda_etapa: false,
        access_token: 'jwt-final',
      }),
    );
    expect(twoFactorMock.iniciarLogin).not.toHaveBeenCalled();
    expect(prismaMock.login_evento.create).toHaveBeenCalledTimes(1);
  });

  it('não cria desafio quando a senha está incorreta', async () => {
    usuariosMock.buscarPorEmail.mockResolvedValue(usuario);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.signIn(usuario.email, 'incorreta'),
    ).rejects.toBeInstanceOf(UnauthorizedException);
    expect(twoFactorMock.iniciarLogin).not.toHaveBeenCalled();
  });

  it('emite o JWT somente depois de confirmar o código do segundo fator', async () => {
    twoFactorMock.verificarCodigo.mockResolvedValue({ usuarioId: 7 });
    prismaMock.cadastro.findFirst.mockResolvedValue(usuario);

    const resultado = await service.confirmarLoginDoisFatores(
      'token-do-desafio',
      '123456',
    );

    expect(twoFactorMock.verificarCodigo).toHaveBeenCalledWith(
      'token-do-desafio',
      '123456',
      'login',
    );
    expect(resultado.access_token).toBe('jwt-final');
    expect(prismaMock.login_evento.create).toHaveBeenCalledTimes(1);
  });

  it('permite concluir o login com um código de recuperação válido', async () => {
    twoFactorMock.verificarCodigoRecuperacao.mockResolvedValue({
      usuarioId: 7,
    });
    prismaMock.cadastro.findFirst.mockResolvedValue(usuario);

    const resultado = await service.confirmarLoginComCodigoRecuperacao(
      'token-do-desafio',
      'ABCD-EFGH',
    );

    expect(twoFactorMock.verificarCodigoRecuperacao).toHaveBeenCalledWith(
      'token-do-desafio',
      'ABCD-EFGH',
      'login',
    );
    expect(resultado.access_token).toBe('jwt-final');
  });
});
