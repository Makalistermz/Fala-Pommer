import {
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type AcaoRecaptcha = 'login' | 'cadastro' | 'recuperar_senha';

interface RespostaRecaptcha {
  success: boolean;
  score?: number;
  action?: string;
}

@Injectable()
export class RecaptchaService {
  constructor(private readonly configService: ConfigService) {}

  async validar(token: string, acaoEsperada: AcaoRecaptcha) {
    const segredo = this.configService.getOrThrow<string>(
      'RECAPTCHA_KEYS_SECRET',
    );

    let resposta: Response;

    try {
      resposta = await fetch(
        'https://www.google.com/recaptcha/api/siteverify',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            secret: segredo,
            response: token,
          }),
        },
      );
    } catch {
      throw new ServiceUnavailableException(
        'Não foi possível realizar a verificação de segurança.',
      );
    }

    if (!resposta.ok) {
      throw new ServiceUnavailableException(
        'Não foi possível realizar a verificação de segurança.',
      );
    }

    const resultado = (await resposta.json()) as RespostaRecaptcha;
    const scoreMinimo = this.obterScoreMinimo();

    if (
      !resultado.success ||
      resultado.action !== acaoEsperada ||
      typeof resultado.score !== 'number' ||
      resultado.score < scoreMinimo
    ) {
      throw new ForbiddenException(
        'Não foi possível confirmar a verificação de segurança.',
      );
    }
  }

  private obterScoreMinimo() {
    const valorConfigurado = Number(
      this.configService.get('RECAPTCHA_MIN_SCORE') ?? 0.5,
    );

    return Number.isFinite(valorConfigurado) ? valorConfigurado : 0.5;
  }
}
