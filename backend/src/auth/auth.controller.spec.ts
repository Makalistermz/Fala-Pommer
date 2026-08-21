import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorEmailService } from './two-factor-email.service';

describe('AuthController - rotas de autenticação em duas etapas', () => {
  const authMock = {
    confirmarLoginDoisFatores: jest.fn(),
    confirmarLoginComCodigoRecuperacao: jest.fn(),
  };
  const twoFactorMock = {
    reenviarCodigoLogin: jest.fn(),
    obterStatus: jest.fn(),
    iniciarAtivacao: jest.fn(),
    confirmarAtivacao: jest.fn(),
    solicitarDesativacao: jest.fn(),
    confirmarDesativacao: jest.fn(),
    confirmarDesativacaoComCodigoRecuperacao: jest.fn(),
    reenviarCodigoConfiguracao: jest.fn(),
  };

  let controller: AuthController;
  const requisicao = {
    usuario: {
      sub: 7,
      tipo: 'user',
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new AuthController(
      authMock as unknown as AuthService,
      twoFactorMock as unknown as TwoFactorEmailService,
    );
  });

  it('delega confirmação, recuperação e reenvio do segundo fator do login', async () => {
    authMock.confirmarLoginDoisFatores.mockResolvedValue({
      access_token: 'jwt',
    });
    authMock.confirmarLoginComCodigoRecuperacao.mockResolvedValue({
      access_token: 'jwt',
    });
    twoFactorMock.reenviarCodigoLogin.mockResolvedValue({ token: 'token' });

    await controller.confirmarLoginDoisFatores({
      token: 'token',
      codigo: '123456',
    });
    await controller.confirmarLoginComCodigoRecuperacao({
      token: 'token',
      codigoRecuperacao: 'ABCD-EFGH',
    });
    await controller.reenviarCodigoLoginDoisFatores({ token: 'token' });

    expect(authMock.confirmarLoginDoisFatores).toHaveBeenCalledWith(
      'token',
      '123456',
    );
    expect(authMock.confirmarLoginComCodigoRecuperacao).toHaveBeenCalledWith(
      'token',
      'ABCD-EFGH',
    );
    expect(twoFactorMock.reenviarCodigoLogin).toHaveBeenCalledWith('token');
  });

  it('retorna o status usando apenas o usuário autenticado', async () => {
    twoFactorMock.obterStatus.mockResolvedValue({ ativo: true });

    await expect(
      controller.statusDoisFatores(requisicao as never),
    ).resolves.toEqual({ ativo: true });
    expect(twoFactorMock.obterStatus).toHaveBeenCalledWith(7);
  });

  it('delega ativação e confirmação com o usuário autenticado', async () => {
    twoFactorMock.iniciarAtivacao.mockResolvedValue({ token: 'token' });
    twoFactorMock.confirmarAtivacao.mockResolvedValue({
      codigos_recuperacao: ['ABCD-EFGH'],
    });

    await controller.configurarDoisFatores(requisicao as never, {
      senha: 'Senha!123',
    });
    await controller.confirmarDoisFatores(requisicao as never, {
      token: 'token',
      codigo: '123456',
    });

    expect(twoFactorMock.iniciarAtivacao).toHaveBeenCalledWith(7, 'Senha!123');
    expect(twoFactorMock.confirmarAtivacao).toHaveBeenCalledWith(
      7,
      'token',
      '123456',
    );
  });

  it('delega os dois caminhos de desativação', async () => {
    twoFactorMock.solicitarDesativacao.mockResolvedValue({ token: 'token' });
    twoFactorMock.confirmarDesativacao.mockResolvedValue({ mensagem: 'ok' });
    twoFactorMock.confirmarDesativacaoComCodigoRecuperacao.mockResolvedValue({
      mensagem: 'ok',
    });

    await controller.solicitarDesativacaoDoisFatores(requisicao as never, {
      senha: 'Senha!123',
    });
    await controller.desativarDoisFatores(requisicao as never, {
      token: 'token',
      codigo: '123456',
    });
    await controller.desativarDoisFatoresComCodigoRecuperacao(
      requisicao as never,
      {
        senha: 'Senha!123',
        codigoRecuperacao: 'ABCD-EFGH',
      },
    );

    expect(twoFactorMock.solicitarDesativacao).toHaveBeenCalledWith(
      7,
      'Senha!123',
    );
    expect(twoFactorMock.confirmarDesativacao).toHaveBeenCalledWith(
      7,
      'token',
      '123456',
    );
    expect(
      twoFactorMock.confirmarDesativacaoComCodigoRecuperacao,
    ).toHaveBeenCalledWith(7, 'Senha!123', 'ABCD-EFGH');
  });

  it('mantém o reenvio de configuração vinculado ao usuário e à finalidade', async () => {
    twoFactorMock.reenviarCodigoConfiguracao.mockResolvedValue({
      token: 'token',
    });

    await controller.reenviarCodigoDoisFatores(requisicao as never, {
      token: 'token',
      finalidade: 'ativacao',
    });

    expect(twoFactorMock.reenviarCodigoConfiguracao).toHaveBeenCalledWith(
      7,
      'token',
      'ativacao',
    );
  });
});
